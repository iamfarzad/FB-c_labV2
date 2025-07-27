import { jwtVerify, SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  exp: number;
}

export async function createToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  
  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'user',
      exp: payload.exp as number
    };
  } catch (error) {
    return null;
  }
}

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Authorization header required' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Add user info to request headers for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-role', payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function adminAuthMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Check for token in cookie first, then Authorization header
  const token = request.cookies.get('adminToken')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Verify admin role
  if (payload.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  // For API routes, we don't use NextResponse.next() - we return null to continue
  // The user info is available via the payload for downstream handlers
  return null;
}

export function getCurrentUser(request: NextRequest): JWTPayload | null {
  const userId = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role') as 'admin' | 'user';

  if (!userId || !email || !role) {
    return null;
  }

  return {
    userId,
    email,
    role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  };
}