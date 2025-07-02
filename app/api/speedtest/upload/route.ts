import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Read the request body to measure upload speed
    const body = await request.arrayBuffer();
    const endTime = Date.now();

    const uploadDuration = (endTime - startTime) / 1000; // in seconds
    const uploadSizeBytes = body.byteLength;
    const uploadSpeedMbps = (uploadSizeBytes * 8) / (uploadDuration * 1000000);

    // Return upload statistics
    return NextResponse.json({
      success: true,
      timestamp: startTime,
      uploadDuration,
      uploadSizeBytes,
      uploadSpeedMbps: Math.round(uploadSpeedMbps * 100) / 100,
      message: 'Upload test completed successfully'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Upload test error:', error);

    return NextResponse.json({
      success: false,
      error: 'Upload test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}

export async function OPTIONS() {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Content-Length',
      'Access-Control-Max-Age': '86400', // 24 hours
    }
  });
}

export async function GET() {
  // Simple endpoint info for testing
  return NextResponse.json({
    endpoint: 'Speed Test Upload',
    method: 'POST',
    description: 'Send binary data to test upload speed',
    maxSize: '100MB',
    headers: {
      'Content-Type': 'application/octet-stream'
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
} 