import { ElevenLabsClient } from 'elevenlabs';

export async function generateVoiceWithElevenLabs(text: string): Promise<{ audioBase64: string } | null> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00tcm4tlvdq8ikwam';

  if (!ELEVENLABS_API_KEY) {
    console.warn("ElevenLabs API key not configured. Skipping voice generation.");
    return null;
  }
  if (!text || text.trim() === "") {
    console.warn("Empty text provided to ElevenLabs. Skipping voice generation.");
    return null;
  }

  try {
    const elevenlabs = new ElevenLabsClient({
      apiKey: ELEVENLABS_API_KEY,
    });

    const audio = await elevenlabs.generate({
      voice: VOICE_ID,
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.8,
        similarity_boost: 0.9,
        style: 0.4,
        use_speaker_boost: true,
      },
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');

    console.log("Successfully generated voice with ElevenLabs.");
    return { audioBase64 };
  } catch (error: any) {
    console.error("Error generating voice with ElevenLabs:", error.message);
    return null;
  }
}
