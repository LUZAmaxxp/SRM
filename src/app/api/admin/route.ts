import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Intervention, Reclamation } from '@/lib/models';
import { isAdminEmail, addAdminEmail, removeAdminEmail } from '@/lib/admin-config';

interface UserDocument {
  _id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  createdAt: Date;
}



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

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Connect to database
    await dbConnect();
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db();

    // Fetch all users from Better Auth collection
    // Better Auth typically uses 'better_auth_users' or similar collection name
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

    // For each user, fetch their interventions and reclamations
    const adminData = await Promise.all(
      users.map(async (user: UserDocument) => {
        const userId = user._id.toString();

        const interventions = await Intervention.find({ userId })
          .sort({ createdAt: -1 })
          .lean();

        const reclamations = await Reclamation.find({ userId })
          .sort({ createdAt: -1 })
          .lean();

        // Get last activity date
        const allRecords = [...interventions, ...reclamations];
        const lastActivity = allRecords.length > 0
          ? new Date(Math.max(...allRecords.map(r => new Date(r.createdAt).getTime())))
          : null;

        return {
          _id: user._id.toString(),
          email: user.email,
          name: user.name || 'N/A',
          emailVerified: user.emailVerified || false,
          createdAt: user.createdAt,
          interventionsCount: interventions.length,
          reclamationsCount: reclamations.length,
          totalRecords: interventions.length + reclamations.length,
          lastActivity: lastActivity,
          interventions: interventions.map((i) => ({
            _id: String((i as Record<string, unknown>)._id),
            startDate: (i as Record<string, unknown>).startDate,
            endDate: (i as Record<string, unknown>).endDate,
            entrepriseName: (i as Record<string, unknown>).entrepriseName,
            responsable: (i as Record<string, unknown>).responsable,
            teamMembers: (i as Record<string, unknown>).teamMembers,
            siteName: (i as Record<string, unknown>).siteName,
            photoUrl: (i as Record<string, unknown>).photoUrl,
            recipientEmails: (i as Record<string, unknown>).recipientEmails,
            createdAt: (i as Record<string, unknown>).createdAt
          })),
          reclamations: reclamations.map((r) => ({
            _id: String((r as Record<string, unknown>)._id),
            date: (r as Record<string, unknown>).date,
            stationName: (r as Record<string, unknown>).stationName,
            reclamationType: (r as Record<string, unknown>).reclamationType,
            description: (r as Record<string, unknown>).description,
            photoUrl: (r as Record<string, unknown>).photoUrl,
            recipientEmails: (r as Record<string, unknown>).recipientEmails,
            createdAt: (r as Record<string, unknown>).createdAt
          }))
        };
      })
    );

    return NextResponse.json(adminData);

  } catch (error) {
    console.error('Error fetching admin data:', error);
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

    // Check if user is admin
    if (!isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, userEmail } = body;

    if (!action || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: action and userEmail' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['promote', 'demote'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "promote" or "demote"' },
        { status: 400 }
      );
    }

    // Prevent admin from demoting themselves
    if (action === 'demote' && session.user.email === userEmail) {
      return NextResponse.json(
        { error: 'You cannot demote yourself' },
        { status: 400 }
      );
    }

    // Connect to database to verify user exists
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db();

    let userExists = false;
    const possibleCollections = ['better_auth_users', 'users', 'accounts', 'user'];

    for (const collectionName of possibleCollections) {
      try {
        const user = await db.collection(collectionName).findOne({ email: userEmail });
        if (user) {
          userExists = true;
          break;
        }
      } catch  {
       
      }
    }

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Perform the action
    if (action === 'promote') {
      addAdminEmail(userEmail);
      console.log(`Promoted ${userEmail} to admin`);
    } else if (action === 'demote') {
      removeAdminEmail(userEmail);
      console.log(`Demoted ${userEmail} from admin`);
    }

    return NextResponse.json({
      success: true,
      message: `User ${userEmail} has been ${action === 'promote' ? 'promoted to' : 'demoted from'} admin role`
    });

  } catch (error) {
    console.error('Error managing admin role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
