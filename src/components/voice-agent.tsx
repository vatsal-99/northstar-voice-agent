"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./voice-agent.module.css";

type Message = {
  id: string;
  role: "customer" | "agent";
  text: string;
};

const SESSION_STORAGE_KEY = "voice-agent-session-id";
const acceptedAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"];

function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const channelCount = audioBuffer.numberOfChannels;
  const frameCount = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = channelCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + frameCount * blockAlign);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + frameCount * blockAlign, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, audioBuffer.sampleRate, true);
  view.setUint32(28, audioBuffer.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, frameCount * blockAlign, true);

  const channels = Array.from({ length: channelCount }, (_, index) =>
    audioBuffer.getChannelData(index),
  );
  let offset = 44;
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function getSessionId(): string {
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const sessionId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

type VoiceAgentProps = {
  compact?: boolean;
};

export default function VoiceAgent({ compact = false }: VoiceAgentProps) {
  const sessionId = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [recordingNotice, setRecordingNotice] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordingChunks = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      mediaRecorder.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const submitAudio = async () => {
    if (!selectedFile || isSubmitting) return;

    setError("");
    setRecordingNotice("");
    setIsSubmitting(true);
    const activeSessionId = sessionId.current ?? getSessionId();
    sessionId.current = activeSessionId;
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-customer`,
        role: "customer",
        text: `Audio submitted: ${selectedFile.name}`,
      },
    ]);

    const formData = new FormData();
    formData.append("audio", selectedFile);
    formData.append("sessionId", activeSessionId);

    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        response?: string;
        error?: string;
      };

      const responseText = payload.response;
      if (!response.ok || !responseText) {
        throw new Error(payload.error ?? "The agent could not process the audio.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-agent`,
          role: "agent",
          text: responseText,
        },
      ]);
      setSelectedFile(null);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "The agent could not process the audio.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRecording = async () => {
    setError("");
    setRecordingNotice("");

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Recording is not supported by this browser. Upload an MP3 or WAV file instead.");
      return;
    }

    const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/wav", "audio/mpeg"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    );
    if (!mimeType) {
      setRecordingNotice(
        "This browser does not support a compatible recording format. Upload an MP3 or WAV file instead.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingChunks.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunks.current.push(event.data);
      };
      recorder.onstop = async () => {
        try {
          setRecordingNotice("Preparing your recording...");
          const recordedBlob = new Blob(recordingChunks.current, { type: mimeType });
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(await recordedBlob.arrayBuffer());
          const wavBlob = audioBufferToWav(audioBuffer);
          await audioContext.close();
          setSelectedFile(new File([wavBlob], `recording-${Date.now()}.wav`, { type: "audio/wav" }));
          setRecordingNotice("");
        } catch {
          setError("The recording could not be converted to WAV. Please try again or upload an MP3/WAV file.");
          setRecordingNotice("");
        } finally {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch {
      setError("Microphone access was not available. Check browser permissions or upload an MP3/WAV file.");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    mediaRecorder.current = null;
    setIsRecording(false);
  };

  return (
    <main className={`${styles.page} ${compact ? styles.compactPage : ""}`}>
      <section className={`${styles.shell} ${compact ? styles.compactShell : ""}`} aria-labelledby="page-title">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Northstar Goods</p>
            <h1 id="page-title">How can we help?</h1>
            <p className={styles.subtitle}>
              Send a voice message about products, orders, or delivery.
            </p>
          </div>
          <span className={styles.status}>
            <span className={styles.statusDot} />
            Voice agent
          </span>
        </header>

        <section className={styles.conversation} aria-live="polite" aria-label="Conversation">
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.waveform} aria-hidden="true">)))</span>
              <h2>Start with a voice message</h2>
              <p>Ask about a product, check an order, or find something for your home.</p>
            </div>
          ) : (
            messages.map((message) => (
              <article
                className={`${styles.message} ${message.role === "customer" ? styles.customerMessage : styles.agentMessage}`}
                key={message.id}
              >
                <span className={styles.messageLabel}>
                  {message.role === "customer" ? "You" : "Northstar"}
                </span>
                <p>{message.text}</p>
              </article>
            ))
          )}
          {isSubmitting && (
            <div className={`${styles.message} ${styles.agentMessage}`}>
              <span className={styles.messageLabel}>Northstar</span>
              <p className={styles.thinking}>Listening and thinking<span>.</span><span>.</span><span>.</span></p>
            </div>
          )}
        </section>

        <section className={styles.composer} aria-label="Send an audio message">
          <div className={styles.fileRow}>
            <label className={styles.uploadButton}>
              <span aria-hidden="true">+</span>
              Choose MP3/WAV
              <input
                type="file"
                accept=".mp3,.wav,audio/mpeg,audio/wav"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setError("");
                  setRecordingNotice("");
                  if (file && !acceptedAudioTypes.includes(file.type.toLowerCase())) {
                    setError("Please choose an MP3 or WAV file.");
                    setSelectedFile(null);
                    return;
                  }
                  setSelectedFile(file);
                }}
              />
            </label>
            <button
              className={`${styles.recordButton} ${isRecording ? styles.recording : ""}`}
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isSubmitting}
            >
              <span className={styles.recordDot} />
              {isRecording ? "Stop recording" : "Record"}
            </button>
          </div>

          <div className={styles.selectedRow}>
            <span className={selectedFile ? styles.fileName : styles.filePlaceholder}>
              {selectedFile ? selectedFile.name : "No audio selected"}
            </span>
            <button
              className={styles.sendButton}
              type="button"
              onClick={submitAudio}
              disabled={!selectedFile || isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send audio"}
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}
          {recordingNotice && <p className={styles.notice} role="status">{recordingNotice}</p>}
          <p className={styles.privacyNote}>Your audio is sent securely to the voice agent for this session.</p>
        </section>
      </section>
    </main>
  );
}
