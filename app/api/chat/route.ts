import { constructPrompt, createStreamingResponse } from "@/lib/chat-utils";
import { generateContentWithGemini } from "@/lib/gemini-api";

export const maxDuration = 30;

interface Message {
  role: string;
  parts: { text: string }[];
}

export async function POST(req: Request) {
  try {
    const { messages, imageData, cameraFrame } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const prompt = constructPrompt(messages as Message[]);

    // Clean image data if necessary
    const cleanedImageData = imageData?.startsWith("data:") ? imageData.split(",")[1] : imageData;
    const cleanedCameraFrame = cameraFrame?.startsWith("data:") ? cameraFrame.split(",")[1] : cameraFrame;

    const text = await generateContentWithGemini(apiKey, prompt, cleanedImageData, cleanedCameraFrame);

    const stream = createStreamingResponse(text);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream", // Changed to text/event-stream for proper SSE handling
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: error.message || "An unknown error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
