import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Intervention } from '@/lib/models';
import { generateInterventionDoc } from '@/lib/docx-generator';
import { emailService } from '@/lib/email-service';
import { checkRateLimit } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get('admin') === 'true';

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

    // Check admin access if admin request
    if (isAdmin) {
      const { isAdminEmail } = await import('@/lib/admin-config');
      const isAdminUser = await isAdminEmail(session.user.email);
      if (!isAdminUser) {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }
    }

    // Connect to database
    await dbConnect();

    let interventions;
    if (isAdmin) {
      // Fetch all interventions for admin (userName is already stored in the document)
      interventions = await Intervention.find({})
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Fetch interventions for current user
      interventions = await Intervention.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json({
      success: true,
      data: interventions
    });

  } catch (error) {
    console.error('Error fetching interventions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



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

    // Validate required fields (matching frontend form)
    const {
      startDate,
      endDate,
      entrepriseName,
      responsable,
      teamMembers,
      siteName,
      recipientEmails,
      photoUrl
    } = body;

    if (!startDate || !endDate || !entrepriseName || !responsable ||
        !teamMembers || !siteName || !recipientEmails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate teamMembers is an array
    if (!Array.isArray(teamMembers) || teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'teamMembers must be a non-empty array' },
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

    // Create new intervention (use the correct schema fields)
    const intervention = new Intervention({
      userId: session.user.id,
      userName: session.user.name || 'N/A',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      entrepriseName,
      responsable,
      teamMembers,
      siteName,
      photoUrl,
      recipientEmails
    });

    // Save to database
    const savedIntervention = await intervention.save();

    // Generate DOCX report (map to expected format for docx generator)
    const docxData = {
      _id: savedIntervention._id,
      employeeName: responsable,
      employeeId: `EMP-${Date.now()}`,
      siteName,
      stationName: siteName,
      interventionType: 'Maintenance',
      description: `Intervention by ${responsable} at ${siteName}. Team: ${teamMembers.join(', ')}. Dates: ${startDate} to ${endDate}. Company: ${entrepriseName}`,
      priority: 'Medium',
      status: 'Pending',
      recipientEmails,
      createdAt: savedIntervention.createdAt,
      updatedAt: savedIntervention.updatedAt
    };

    const docxBuffer = await generateInterventionDoc(docxData);

    // Send email with attachment using SMTP
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Intervention_Report_${timestamp}.docx`;

    const emailSent = await emailService.sendReportEmail(
      recipientEmails,
      `New Intervention Report - ${siteName}`,
      docxBuffer,
      fileName,
      'intervention'
    );

    if (!emailSent) {
      console.error('Failed to send intervention report email');
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      ...savedIntervention.toObject(),
      message: 'Intervention submitted successfully and report sent to provided emails.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating intervention:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
