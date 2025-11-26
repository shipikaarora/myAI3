"use client";

import { Mic, MicOff } from "lucide-react";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "hi-IN"; // Hindi by default, auto-detect bhi karega

    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join("");
      if (event.results[0].isFinal) {
        onTranscript(transcript);
        setIsListening(false);
      }
    };

    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    setRecognition(rec);
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setIsListening(!isListening);
  };

  if (!recognition) return null;

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-3 transition-all ${
        isListening
          ? "bg-red-600 hover:bg-red-700 animate-pulse"
          : "bg-orange-600 hover:bg-orange-700"
      }`}
    >
      {isListening ? <MicOff className="size-6 text-white" /> : <Mic className="size-6 text-white" />}
    </button>
  );
}
