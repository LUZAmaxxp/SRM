import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Reclamation } from '@/lib/models';
import { generateReclamationDoc } from '@/lib/docx-generator';
import { emailService } from '@/lib/email-service';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check rate limit
    const withinLimit = await checkRateLimit(session.user.id);
    if (!withinLimit) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You can only submit up to 15 interventions and reclamations per day.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields (matching the actual schema)
    const {
      date,
      stationName,
      reclamationType,
      description,
      photoUrl,
      recipientEmails
    } = body;

    if (!date || !stationName || !reclamationType || !description || !recipientEmails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate reclamationType
    const validTypes = ['hydraulic', 'electric', 'mechanic'];
    if (!validTypes.includes(reclamationType)) {
      return NextResponse.json(
        { error: 'Invalid reclamationType. Must be one of: hydraulic, electric, mechanic' },
        { status: 400 }
      );
    }

    // Validate recipientEmails is an array of valid emails
    if (!Array.isArray(recipientEmails) || recipientEmails.length === 0) {
      return NextResponse.json(
        { error: 'recipientEmails must be a non-empty array' },
        { status: 400 }
      );
    }

    // Create new reclamation (use correct schema fields)
    const reclamation = new Reclamation({
      userId: session.user.id,
      date: new Date(date),
      stationName,
      reclamationType,
      description,
      photoUrl,
      recipientEmails
    });

    // Save to database
    const savedReclamation = await reclamation.save();

    // Generate DOCX report
    const docxData = {
      _id: savedReclamation._id.toString(),
      employeeName: session.user.name || 'N/A',
      employeeId: `EMP-${Date.now()}`,
      siteName: stationName,
      stationName: stationName,
      reclamationType: reclamationType,
      description: description,
      priority: 'Medium',
      status: 'Pending',
      photoUrl: photoUrl,
      recipientEmails: recipientEmails,
      createdAt: savedReclamation.createdAt,
      updatedAt: savedReclamation.updatedAt,
      date: new Date(date) // Add the form date
    };

    const docxBuffer = await generateReclamationDoc(docxData);

    // Send email with attachment using the new email service
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Reclamation_Report_${timestamp}.docx`;

    const emailSent = await emailService.sendReportEmail(
      recipientEmails,
      `New Reclamation Report - ${stationName}`,
      docxBuffer,
      fileName,
      'reclamation'
    );

    if (!emailSent) {
      console.error('Failed to send reclamation report email');
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      ...savedReclamation.toObject(),
      message: 'Reclamation submitted successfully and report sent to provided emails.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating reclamation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
