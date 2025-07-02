import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size') || '1MB';
  const formatParam = searchParams.get('format') || 'binary';

  // Parse size parameter
  let sizeInBytes: number;
  const sizeMatch = sizeParam.match(/^(\d+(?:\.\d+)?)(KB|MB|GB)?$/i);

  if (!sizeMatch) {
    return NextResponse.json({ error: 'Invalid size parameter' }, { status: 400 });
  }

  const [, sizeValue, unit] = sizeMatch;
  const size = parseFloat(sizeValue);

  switch (unit?.toUpperCase()) {
    case 'KB':
      sizeInBytes = Math.floor(size * 1024);
      break;
    case 'GB':
      sizeInBytes = Math.floor(size * 1024 * 1024 * 1024);
      break;
    case 'MB':
    default:
      sizeInBytes = Math.floor(size * 1024 * 1024);
      break;
  }

  // Limit maximum size to prevent abuse (max 500MB)
  if (sizeInBytes > 500 * 1024 * 1024) {
    return NextResponse.json({ error: 'Maximum size is 500MB' }, { status: 400 });
  }

  // Set appropriate headers for speed testing
  const headers = {
    'Content-Type': formatParam === 'json' ? 'application/json' : 'application/octet-stream',
    'Content-Length': sizeInBytes.toString(),
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Generate test data
  if (formatParam === 'json') {
    // Generate JSON test data
    const testData = {
      timestamp: Date.now(),
      size: sizeParam,
      format: 'json',
      data: 'x'.repeat(Math.max(0, sizeInBytes - 200)) // Subtract approximate JSON overhead
    };

    return NextResponse.json(testData, { headers });
  } else {
    // Generate binary test data as a readable stream
    const stream = new ReadableStream({
      start(controller) {
        const chunkSize = 64 * 1024; // 64KB chunks
        let remaining = sizeInBytes;

        const sendChunk = () => {
          if (remaining <= 0) {
            controller.close();
            return;
          }

          const currentChunkSize = Math.min(chunkSize, remaining);
          const chunk = new Uint8Array(currentChunkSize);

          // Fill with pseudo-random data to prevent compression
          for (let i = 0; i < currentChunkSize; i++) {
            chunk[i] = Math.floor(Math.random() * 256);
          }

          controller.enqueue(chunk);
          remaining -= currentChunkSize;

          // Use setTimeout to prevent blocking
          setTimeout(sendChunk, 0);
        };

        sendChunk();
      }
    });

    return new NextResponse(stream, { headers });
  }
}

export async function HEAD(request: NextRequest) {
  // Support HEAD requests for latency testing
  const { searchParams } = new URL(request.url);
  const sizeParam = searchParams.get('size') || '1MB';

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'X-Test-Size': sizeParam,
    }
  });
}

export async function OPTIONS() {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
} 