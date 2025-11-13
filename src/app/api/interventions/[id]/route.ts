import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Intervention } from '@/lib/models';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: 'Intervention ID is required' },
      { status: 400 }
    );
  }

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

    // Check admin access
    const { isAdminEmail } = await import('@/lib/admin-config');
    const isAdminUser = await isAdminEmail(session.user.email);
    if (!isAdminUser) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Connect to database
    await dbConnect();

    // Delete the intervention
    const deletedIntervention = await Intervention.findByIdAndDelete(id);

    if (!deletedIntervention) {
      return NextResponse.json(
        { error: 'Intervention not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Intervention deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting intervention:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
