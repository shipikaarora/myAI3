"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseWebSpeechReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    isSpeaking: boolean;
    speak: (text: string) => void;
    stopSpeaking: () => void;
    supported: boolean;
}

export function useWebSpeech(): UseWebSpeechReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(false);

    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Check support
            const SpeechRecognition =
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;

            if (SpeechRecognition && window.speechSynthesis) {
                setSupported(true);
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true; // Keep listening
                recognitionRef.current.interimResults = true; // Show real-time results
                recognitionRef.current.lang = "en-IN"; // Default to Indian English given the context

                recognitionRef.current.onstart = () => setIsListening(true);
                recognitionRef.current.onend = () => setIsListening(false);
                recognitionRef.current.onresult = (event: any) => {
                    let finalTranscript = "";
                    let interimTranscript = "";

                    // Iterate from 0 to capture the full session transcript
                    for (let i = 0; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
                    setTranscript(finalTranscript + interimTranscript);
                };

                synthesisRef.current = window.speechSynthesis;
            }
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Speech recognition start error:", e);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript("");
    }, []);

    const speak = useCallback((text: string) => {
        if (synthesisRef.current) {
            // Cancel current speech
            synthesisRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            // Try to select a good voice
            const voices = synthesisRef.current.getVoices();
            // Prioritize Indian English, then Google English, then default
            const preferredVoice =
                voices.find(v => (v.lang === "en-IN" || v.lang.includes("India")) && v.name.includes("Google")) ||
                voices.find(v => v.lang === "en-IN" || v.lang.includes("India")) ||
                voices.find(v => v.name.includes("Google") && v.lang.includes("en")) ||
                voices[0];

            if (preferredVoice) utterance.voice = preferredVoice;

            // Slightly slower rate for better clarity if needed, but 1.0 is usually standard
            utterance.rate = 1.0;

            synthesisRef.current.speak(utterance);
        }
    }, []);

    const stopSpeaking = useCallback(() => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        isSpeaking,
        speak,
        stopSpeaking,
        supported,
    };
}
