import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Intervention, Reclamation } from '@/lib/models';
import * as XLSX from 'xlsx';

interface UserDocument {
  _id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  createdAt: Date;
}

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

    if (isAdmin) {
      // Export all users for admin
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
      await client.connect();
      const db = client.db();

      // Fetch all users from Better Auth collection
      let users: UserDocument[] = [];
      const possibleCollections = ['better_auth_users', 'users', 'accounts', 'user'];

      for (const collectionName of possibleCollections) {
        try {
          const collectionUsers = await db.collection(collectionName).find({}).toArray() as unknown as UserDocument[];
          if (collectionUsers.length > 0) {
            users = collectionUsers;
            console.log(`Found ${users.length} users in collection '${collectionName}'`);
            break;
          }
        } catch (error) {
          console.log(`Collection '${collectionName}' not found or error:`, (error as Error).message);
        }
      }

      if (users.length === 0) {
        console.log('No users found in any collection');
      }

      // For each user, fetch their interventions and reclamations count
      const usersData = await Promise.all(
        users.map(async (user: UserDocument) => {
          const userId = user._id;

          const interventionsCount = await Intervention.countDocuments({ userId });
          const reclamationsCount = await Reclamation.countDocuments({ userId });

          // Get last activity date
          const [lastIntervention] = await Intervention.find({ userId }).sort({ createdAt: -1 }).limit(1).select('createdAt').lean();
          const [lastReclamation] = await Reclamation.find({ userId }).sort({ createdAt: -1 }).limit(1).select('createdAt').lean();

          const lastActivity = lastIntervention || lastReclamation
            ? new Date(Math.max(
                lastIntervention ? new Date(lastIntervention.createdAt).getTime() : 0,
                lastReclamation ? new Date(lastReclamation.createdAt).getTime() : 0
              ))
            : null;

          return {
            'ID': user._id.toString(),
            'Email': user.email,
            'Name': user.name || 'N/A',
            'Email Verified': user.emailVerified ? 'Yes' : 'No',
            'Joined Date': new Date(user.createdAt).toLocaleDateString(),
            'Last Activity': lastActivity ? lastActivity.toLocaleDateString() : 'Never',
            'Total Interventions': interventionsCount,
            'Total Reclamations': reclamationsCount,
            'Total Records': interventionsCount + reclamationsCount,
          };
        })
      );

      // Create workbook with users sheet
      const workbook = XLSX.utils.book_new();

      // Users sheet
      const usersSheet = XLSX.utils.json_to_sheet(usersData);
      XLSX.utils.book_append_sheet(workbook, usersSheet, 'All Users');

      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Return Excel file as response
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `Users_Export_${timestamp}.xlsx`;

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    } else {
      // Regular user export (interventions and reclamations)
      // Fetch all interventions for the current user
      const allInterventions = await Intervention.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();

      // Fetch all reclamations for the current user
      const allReclamations = await Reclamation.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();

      // Prepare data for Excel export
      const interventionData = allInterventions.map((intervention, index) => ({
        'ID': index + 1,
        'Type': 'Intervention',
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

      const reclamationData = allReclamations.map((reclamation, index) => ({
        'ID': allInterventions.length + index + 1,
        'Type': 'Reclamation',
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
    }

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
