import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
  userId: string;
}

/**
 * Require authentication for an API route
 * Returns userId if authenticated, or error response if not
 */
export async function requireAuth(): Promise<{ userId: string } | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  return { userId };
}

/**
 * Require admin authentication for an API route
 * Returns userId if authenticated and user is admin, or error response if not
 * Admin check: Verify against ADMIN_USER_IDS environment variable
 */
export async function requireAdminAuth(): Promise<{ userId: string } | NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  // Check if user is in the admin list
  const adminUserIds = (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim()).filter(Boolean);
  
  if (!adminUserIds.includes(userId)) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Admin access required' },
      { status: 403 }
    );
  }

  return { userId };
}
