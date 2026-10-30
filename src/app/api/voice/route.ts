import { NextResponse } from "next/server";
import { runVoiceAgent } from "@/lib/agent";
import { validateAudioUpload } from "@/lib/audio-validation";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "The request must be a valid multipart form submission." },
      { status: 400 },
    );
  }

  const entry = formData.get("audio");
  const file = entry instanceof File ? entry : null;
  const validation = validateAudioUpload(file, formData.get("sessionId"));
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status },
    );
  }
  if (!file) {
    return NextResponse.json(
      { error: "An audio file is required in the 'audio' field." },
      { status: 400 },
    );
  }

  try {
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    const result = await runVoiceAgent(validation.sessionId, {
      data,
      format: validation.format,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Voice agent request failed", error);
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "The voice agent could not process this request.";
    return NextResponse.json(
      { error: `The voice agent could not process this request: ${message}` },
      { status: 502 },
    );
  }
}
