export const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

const supportedFormats = new Map<string, "mp3" | "wav">([
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
  ["audio/wave", "wav"],
]);

export function validateAudioUpload(
  file: File | null,
  sessionId: FormDataEntryValue | null,
): { ok: true; format: "mp3" | "wav"; sessionId: string } | {
  ok: false;
  error: string;
  status: 400 | 415;
} {
  if (!file) {
    return {
      ok: false,
      error: "An audio file is required in the 'audio' field.",
      status: 400,
    };
  }
  if (typeof sessionId !== "string" || !sessionId.trim()) {
    return {
      ok: false,
      error: "A sessionId is required.",
      status: 400,
    };
  }
  if (file.size === 0 || file.size > MAX_AUDIO_BYTES) {
    return {
      ok: false,
      error: "Audio must be greater than zero and no larger than 10 MB.",
      status: 400,
    };
  }

  const format = supportedFormats.get(file.type.toLowerCase());
  if (!format) {
    return {
      ok: false,
      error: "Only MP3 and WAV audio files are supported.",
      status: 415,
    };
  }

  return { ok: true, format, sessionId: sessionId.trim() };
}
