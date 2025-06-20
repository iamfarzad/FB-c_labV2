import { NextRequest, NextResponse } from 'next/server';
import handler from '@/api/gemini-proxy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = request.nextUrl.searchParams.get('action') || 'conversationalFlow';
    
    // Create a mock VercelRequest and VercelResponse
    const mockReq = {
      body,
      query: { action },
      method: 'POST',
      headers: Object.fromEntries(request.headers.entries())
    } as any;
    
    let responseData: any = null;
    let responseStatus = 200;
    
    const mockRes = {
      status: (code: number) => {
        responseStatus = code;
        return mockRes;
      },
      json: (data: any) => {
        responseData = data;
        return mockRes;
      },
      setHeader: () => mockRes,
      end: () => mockRes
    } as any;
    
    // Call the handler
    await handler(mockReq, mockRes);
    
    // Return the response
    if (responseData) {
      return NextResponse.json(responseData, { status: responseStatus });
    } else {
      return NextResponse.json({ success: false, error: 'No response data' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in AI service route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 