"use client";
import { useState, useRef, useCallback } from "react";
import { speechAPI } from "@/lib/api";
import toast from "react-hot-toast";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [waveData, setWaveData] = useState<number[]>(Array(24).fill(4));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const srRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  const [liveTranscript, setLiveTranscript] = useState("");

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Waveform
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      analyserRef.current = analyser;

      const draw = () => {
        const d = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(d);
        setWaveData(Array.from(d.slice(0, 24)).map((v) => Math.max(4, (v / 255) * 52)));
        animRef.current = requestAnimationFrame(draw);
      };
      draw();

      // MediaRecorder for Whisper
      const mr = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm",
      });
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(250);
      mediaRecorderRef.current = mr;

      // Browser Speech Recognition for live transcript
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const sr = new SR();
        sr.continuous = true;
        sr.interimResults = true;
        sr.lang = "en-US";
        let finalText = "";
        sr.onresult = (e: any) => {
          let interim = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
            else interim += e.results[i][0].transcript;
          }
          transcriptRef.current = finalText + interim;
          setLiveTranscript(finalText + interim);
        };
        sr.start();
        srRef.current = sr;
      }

      setIsRecording(true);
      setRecordingSeconds(0);
      setLiveTranscript("");
      transcriptRef.current = "";
      timerRef.current = setInterval(() => setRecordingSeconds((t) => t + 1), 1000);
    } catch {
      toast.error("Microphone access denied.");
    }
  }, []);

  const stopAndTranscribe = useCallback(async (): Promise<string> => {
    return new Promise((resolve) => {
      srRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setWaveData(Array(24).fill(4));

      if (!mediaRecorderRef.current) return resolve(transcriptRef.current || "");

      mediaRecorderRef.current.onstop = async () => {
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
        const localTranscript = transcriptRef.current;

        // Try Whisper for better accuracy
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          if (blob.size > 1000) {
            setIsTranscribing(true);
            try {
              const { data } = await speechAPI.transcribe(blob);
              setLiveTranscript(data.transcript);
              setIsTranscribing(false);
              setIsRecording(false);
              resolve(data.transcript);
              return;
            } catch {
              // Fall through to browser transcript
            }
            setIsTranscribing(false);
          }
        }
        setIsRecording(false);
        resolve(localTranscript);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    srRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    setWaveData(Array(24).fill(4));
    setLiveTranscript("");
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return {
    isRecording, isTranscribing, recordingSeconds,
    formattedTime: formatTime(recordingSeconds),
    liveTranscript, waveData,
    startRecording, stopAndTranscribe, cancelRecording,
    setLiveTranscript,
  };
};
