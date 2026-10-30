import { NextResponse } from "next/server";
import { runVoiceAgent } from "@/lib/agent";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const supportedFormats = new Map<string, "mp3" | "wav">([
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
  ["audio/wave", "wav"],
]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("audio");
  const sessionId = formData.get("sessionId");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "An audio file is required in the 'audio' field." },
      { status: 400 },
    );
  }
  if (typeof sessionId !== "string" || !sessionId.trim()) {
    return NextResponse.json(
      { error: "A sessionId is required." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json(
      { error: "Audio must be greater than zero and no larger than 10 MB." },
      { status: 400 },
    );
  }

  const format = supportedFormats.get(file.type.toLowerCase());
  if (!format) {
    return NextResponse.json(
      { error: "Only MP3 and WAV audio files are supported." },
      { status: 415 },
    );
  }

  try {
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await runVoiceAgent(sessionId.trim(), {
      data,
      format,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Voice agent request failed", error);
    return NextResponse.json(
      { error: "The voice agent could not process this request." },
      { status: 502 },
    );
  }
}
