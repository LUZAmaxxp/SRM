import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Intervention, Reclamation } from '@/lib/models';
import * as XLSX from 'xlsx';

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

    // Check admin access if admin export requested
    if (isAdmin) {
      const adminEmails = ['a.allouch@srm-sm.ma', 'allouchayman21@gmail.com'];
      if (!adminEmails.includes(session.user.email)) {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }
    }

    // Connect to database
    await dbConnect();

    let allInterventions: Record<string, unknown>[] = [];
    let allReclamations: Record<string, unknown>[] = [];

    if (isAdmin) {
      // Fetch all interventions and reclamations for all users
      allInterventions = await Intervention.find({})
        .sort({ createdAt: -1 })
        .populate('userId', 'email name')
        .lean();

      allReclamations = await Reclamation.find({})
        .sort({ createdAt: -1 })
        .populate('userId', 'email name')
        .lean();
    } else {
      // Fetch all interventions for the current user
      allInterventions = await Intervention.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();

      // Fetch all reclamations for the current user
      allReclamations = await Reclamation.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();
    }

    const interventions = allInterventions;
    const reclamations = allReclamations;

    // Prepare data for Excel export
    const interventionData = interventions.map((intervention, index) => ({
      'ID': index + 1,
      'Type': 'Intervention',
      'User Email': isAdmin ? ((intervention.userId as Record<string, unknown>)?.email as string) || 'N/A' : 'N/A',
      'User Name': isAdmin ? ((intervention.userId as Record<string, unknown>)?.name as string) || 'N/A' : 'N/A',
      'Start Date': new Date(intervention.startDate as string).toLocaleDateString(),
      'End Date': new Date(intervention.endDate as string).toLocaleDateString(),
      'Company Name': intervention.entrepriseName as string,
      'Responsible Person': intervention.responsable as string,
      'Team Members': (intervention.teamMembers as string[]).join(', '),
      'Site Name': intervention.siteName as string,
      'Photo URL': (intervention.photoUrl as string) || 'N/A',
      'Recipient Emails': (intervention.recipientEmails as string[]).join(', '),
      'Created At': new Date(intervention.createdAt as string).toLocaleString(),
    }));

    const reclamationData = reclamations.map((reclamation, index) => ({
      'ID': interventions.length + index + 1,
      'Type': 'Reclamation',
      'User Email': isAdmin ? ((reclamation.userId as Record<string, unknown>)?.email as string) || 'N/A' : 'N/A',
      'User Name': isAdmin ? ((reclamation.userId as Record<string, unknown>)?.name as string) || 'N/A' : 'N/A',
      'Date': new Date(reclamation.date as string).toLocaleDateString(),
      'Station Name': reclamation.stationName as string,
      'Reclamation Type': reclamation.reclamationType as string,
      'Description': reclamation.description as string,
      'Photo URL': (reclamation.photoUrl as string) || 'N/A',
      'Recipient Emails': (reclamation.recipientEmails as string[]).join(', '),
      'Created At': new Date(reclamation.createdAt as string).toLocaleString(),
    }));

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();

    // Interventions sheet
    const interventionsSheet = XLSX.utils.json_to_sheet(interventionData);
    XLSX.utils.book_append_sheet(workbook, interventionsSheet, 'Interventions');

    // Reclamations sheet
    const reclamationsSheet = XLSX.utils.json_to_sheet(reclamationData);
    XLSX.utils.book_append_sheet(workbook, reclamationsSheet, 'Reclamations');

    // Combined sheet with all records
    const combinedData = [...interventionData, ...reclamationData];
    const combinedSheet = XLSX.utils.json_to_sheet(combinedData);
    XLSX.utils.book_append_sheet(workbook, combinedSheet, 'All Records');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return Excel file as response
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `Records_Export_${timestamp}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
