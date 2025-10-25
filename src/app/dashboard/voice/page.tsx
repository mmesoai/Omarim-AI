"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Play, Loader2, Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { convertSpeechToText } from "@/ai/flows/convert-speech-to-text";
import { convertTextToSpeech } from "@/ai/flows/convert-text-to-speech";
import { Label } from "@/components/ui/label";

export default function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [textToSpeak, setTextToSpeak] = useState("Hello from Omarim AI. I can read any text you provide.");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcribedAudioUrl, setTranscribedAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = async () => {
    setTranscription("");
    setTranscribedAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        title: "Microphone Error",
        description: "Could not access the microphone. Please check your browser permissions.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  }

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscription("");
    try {
      const audioDataUri = await blobToDataURL(audioBlob);
      const result = await convertSpeechToText({ audioDataUri });
      setTranscription(result.transcription);
      if (result.transcription) {
        handleSpeak(result.transcription, setTranscribedAudioUrl);
      }
    } catch (error) {
      console.error("Transcription failed:", error);
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe the audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSpeak = async (text: string, audioUrlSetter: (url: string | null) => void) => {
    if (!text) return;
    setIsSpeaking(true);
    audioUrlSetter(null);
    try {
      const result = await convertTextToSpeech({ text });
      audioUrlSetter(result.audioDataUri);
    } catch (error) {
       console.error("Text-to-speech failed:", error);
      toast({
        title: "Text-to-Speech Failed",
        description: "Could not convert text to speech. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSpeaking(false);
    }
  };
  
  useEffect(() => {
    if (audioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play();
    }
  }, [audioUrl]);

  return (
    <div className="space-y-6">
       <audio ref={audioPlayerRef} />
      <div>
        <h2 className="text-2xl font-headline font-semibold">Voice Tools</h2>
        <p className="text-muted-foreground">
          Leverage speech-to-text and text-to-speech capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Speech-to-Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`rounded-full w-24 h-24 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                disabled={isTranscribing}
              >
                {isTranscribing ? <Loader2 size={32} className="animate-spin" /> : (isRecording ? <Square size={32} /> : <Mic size={32} />) }
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {isTranscribing ? "Transcribing..." : (isRecording ? "Recording... Click to stop." : "Click the button to start recording.")}
            </p>
            <div className="space-y-2">
              <Label htmlFor="transcription">Transcription</Label>
              <Textarea
                id="transcription"
                placeholder="Your transcribed text will appear here..."
                value={transcription}
                readOnly
                className="min-h-[150px]"
              />
            </div>
            {transcribedAudioUrl && (
              <div>
                <Label>Listen to Transcription</Label>
                <audio src={transcribedAudioUrl} controls className="w-full mt-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Text-to-Speech</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="text-to-speak">Text to read</Label>
              <Textarea
                id="text-to-speak"
                placeholder="Enter text here..."
                value={textToSpeak}
                onChange={(e) => setTextToSpeak(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <Button onClick={() => handleSpeak(textToSpeak, setAudioUrl)} disabled={isSpeaking || !textToSpeak}>
              {isSpeaking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="mr-2 h-4 w-4" />
              )}
              Speak Text
            </Button>
             {audioUrl && (
                <div>
                  <audio src={audioUrl} controls className="w-full mt-4" />
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
