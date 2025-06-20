import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { videoId, videoUrl } = await request.json();
    
    if (!videoId && !videoUrl) {
      return NextResponse.json(
        { error: 'Video ID or URL is required' },
        { status: 400 }
      );
    }

    // For now, return a mock transcript since we don't have a real transcript service
    // In production, you would integrate with a service like:
    // - YouTube Transcript API
    // - AssemblyAI
    // - Rev.ai
    // - Or use youtube-transcript npm package
    
    const mockTranscript = [
      {
        start: 0,
        duration: 5,
        text: "Welcome to this video tutorial on AI and machine learning concepts."
      },
      {
        start: 5,
        duration: 8,
        text: "Today we'll be exploring how artificial intelligence can transform business processes."
      },
      {
        start: 13,
        duration: 6,
        text: "Let's start with the fundamentals and work our way up to advanced applications."
      },
      {
        start: 19,
        duration: 7,
        text: "The key to successful AI implementation is understanding your specific business needs."
      }
    ];

    return NextResponse.json({
      success: true,
      transcript: mockTranscript,
      note: 'This is a mock transcript. In production, integrate with a real transcript service.'
    });

  } catch (error) {
    console.error('YouTube transcript error:', error);
    return NextResponse.json(
      { error: 'Failed to get transcript' },
      { status: 500 }
    );
  }
} 