import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Intervention, Reclamation } from '@/lib/models';

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

    // Fetch interventions for the current user
    const interventions = await Intervention.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch reclamations for the current user
    const reclamations = await Reclamation.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Combine and sort by createdAt descending
    const records = [...interventions, ...reclamations]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Add user name to each record
    const recordsWithUserNames = records.map(record => ({
      ...record,
      userName: session.user.name || 'N/A'
    }));

    return NextResponse.json(recordsWithUserNames);

  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
