import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Intervention, Reclamation } from '@/lib/models';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
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

    // Fetch all interventions for the current user
    const interventions = await Intervention.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch all reclamations for the current user
    const reclamations = await Reclamation.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Prepare data for Excel export
    const interventionData = interventions.map((intervention, index) => ({
      'ID': index + 1,
      'Type': 'Intervention',
      'Start Date': new Date(intervention.startDate).toLocaleDateString(),
      'End Date': new Date(intervention.endDate).toLocaleDateString(),
      'Company Name': intervention.entrepriseName,
      'Responsible Person': intervention.responsable,
      'Team Members': intervention.teamMembers.join(', '),
      'Site Name': intervention.siteName,
      'Photo URL': intervention.photoUrl || 'N/A',
      'Recipient Emails': intervention.recipientEmails.join(', '),
      'Created At': new Date(intervention.createdAt).toLocaleString(),
    }));

    const reclamationData = reclamations.map((reclamation, index) => ({
      'ID': interventions.length + index + 1,
      'Type': 'Reclamation',
      'Date': new Date(reclamation.date).toLocaleDateString(),
      'Station Name': reclamation.stationName,
      'Reclamation Type': reclamation.reclamationType,
      'Description': reclamation.description,
      'Photo URL': reclamation.photoUrl || 'N/A',
      'Recipient Emails': reclamation.recipientEmails.join(', '),
      'Created At': new Date(reclamation.createdAt).toLocaleString(),
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
