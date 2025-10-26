
"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Volume2, Bot, BrainCircuit, Waves } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { convertSpeechToText } from "@/ai/flows/convert-speech-to-text";
import { convertTextToSpeech } from "@/ai/flows/convert-text-to-speech";
import { interpretCommand } from "@/ai/flows/interpret-command";
import { generateSocialMediaPost, type GenerateSocialMediaPostOutput } from "@/ai/flows/generate-social-post";
import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type CommandState = 
  | 'idle' 
  | 'recording' 
  | 'transcribing' 
  | 'interpreting' 
  | 'executing' 
  | 'responding';

type AgentResult = 
  | { type: 'social'; data: GenerateSocialMediaPostOutput };

export default function VoicePage() {
  const [commandState, setCommandState] = useState<CommandState>('idle');
  const [transcription, setTranscription] = useState("");
  const [textToSpeak, setTextToSpeak] = useState("Hello, I am Omarim AI. I can read any text you provide.");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = async () => {
    setTranscription("");
    setAgentResult(null);
    setCommandState('recording');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const supportedTypes = ['audio/wav', 'audio/webm', 'audio/ogg'];
      const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        title: "Microphone Error",
        description: "Could not access the microphone. Please check your browser permissions.",
        variant: "destructive",
      });
      setCommandState('idle');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setCommandState('transcribing');
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
    setTranscription("");
    if (audioBlob.size === 0) {
      toast({ title: "Transcription Failed", description: "No audio was recorded. Please try again.", variant: "destructive" });
      setCommandState('idle');
      return;
    }
    try {
      const audioDataUri = await blobToDataURL(audioBlob);
      const result = await convertSpeechToText({ audioDataUri });
      setTranscription(result.transcription);
      if (result.transcription && result.transcription.trim() !== '') {
        handleInterpretation(result.transcription);
      } else {
        toast({ title: "Transcription Failed", description: "The audio was unclear or silent. Please try again.", variant: "destructive" });
        setCommandState('idle');
      }
    } catch (error: any) {
      console.error("Transcription failed:", error);
      toast({ title: "Transcription Failed", description: error.message || "Could not transcribe the audio.", variant: "destructive" });
      setCommandState('idle');
    }
  };

  const handleInterpretation = async (commandText: string) => {
    setCommandState('interpreting');
    try {
      const result = await interpretCommand({ command: commandText });
      await handleExecution(result.action, result.prompt);
    } catch (error) {
      console.error("Interpretation failed:", error);
      toast({ title: "Interpretation Failed", description: "Could not understand the command.", variant: "destructive" });
      setCommandState('idle');
    }
  };
  
  const handleExecution = async (action: string, prompt: string) => {
    setCommandState('executing');
    setAgentResult(null);
    try {
      let responseText = "";
      if (action === "generate_social_post") {
        const output = await generateSocialMediaPost({ topic: prompt });
        setAgentResult({ type: 'social', data: output });
        responseText = `This is Omarim AI. I've created a social media post about ${prompt}.`;
      } else if (action === 'add_store') {
        responseText = `This is Omarim AI. Understood. Navigating to integrations to add your ${prompt || 'new'} store.`;
        setTimeout(() => router.push(`/dashboard/settings?tab=integrations&action=addStore&storeType=${prompt || ''}`), 2000);
      } else {
         responseText = "This is Omarim AI. I'm sorry, I did not recognize that command. Please try again.";
      }
      await handleSpeak(responseText, true);
    } catch (error) {
       console.error("Execution failed:", error);
       toast({ title: "Action Failed", description: "There was an error performing the action.", variant: "destructive" });
       setCommandState('idle');
    }
  };

  const handleSpeak = async (text: string, isCommandResponse = false) => {
    if (!text) return;
    if(isCommandResponse) {
      setCommandState('responding');
    } else {
      setIsSpeaking(true);
    }
    setTtsAudioUrl(null);
    try {
      const result = await convertTextToSpeech({ text });
      setTtsAudioUrl(result.audioDataUri);
    } catch (error) {
       console.error("Text-to-speech failed:", error);
      toast({
        title: "Text-to-Speech Failed",
        description: "Could not convert text to speech. Please try again.",
        variant: "destructive",
      });
    } finally {
      // The 'idle' state for command responses will be set in the onEnded event of the audio player
      if(!isCommandResponse) {
        setIsSpeaking(false);
      }
    }
  };
  
  useEffect(() => {
    if (ttsAudioUrl && audioPlayerRef.current) {
      audioPlayerRef.current.src = ttsAudioUrl;
      audioPlayerRef.current.play().catch(e => console.error("Audio playback failed", e));
    }
  }, [ttsAudioUrl]);

  const onAudioEnded = () => {
    if (commandState === 'responding') {
      setCommandState('idle');
    }
    setTtsAudioUrl(null);
  };

  const getStatusInfo = () => {
    switch (commandState) {
      case 'idle': return { icon: BrainCircuit, text: 'Ready for your command.' };
      case 'recording': return { icon: Waves, text: 'Listening...' };
      case 'transcribing': return { icon: Loader2, text: 'Transcribing your speech...', spin: true };
      case 'interpreting': return { icon: Loader2, text: 'Understanding your command...', spin: true };
      case 'executing': return { icon: Loader2, text: 'Working on your request...', spin: true };
      case 'responding': return { icon: Loader2, text: 'Finalizing response...', spin: true };
      default: return { icon: BrainCircuit, text: 'I am Omarim AI. Click the button and speak a command.' };
    }
  }

  const isProcessing = commandState !== 'idle' && commandState !== 'recording';
  const { icon: StatusIcon, text: statusText, spin: isSpinning } = getStatusInfo();

  return (
    <div className="space-y-6">
       <audio ref={audioPlayerRef} onEnded={onAudioEnded} />
      <div>
        <h2 className="text-2xl font-headline font-semibold">Voice Tools</h2>
        <p className="text-muted-foreground">
          Leverage speech-to-text and text-to-speech capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader className="flex-row gap-4 items-center">
            <Bot className="w-10 h-10 text-primary" />
            <div>
              <CardTitle>Voice Command Center</CardTitle>
              <CardDescription>Speak your commands to Omarim AI.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-grow flex-col items-center justify-center space-y-4 text-center">
            <Button
              size="lg"
              onClick={commandState === 'recording' ? handleStopRecording : handleStartRecording}
              className={cn(
                'rounded-full w-24 h-24 transition-all duration-300 shadow-lg',
                commandState === 'recording' ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90',
                isProcessing && 'bg-muted-foreground cursor-not-allowed'
              )}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 size={32} className="animate-spin" /> : (commandState === 'recording' ? <Square size={32} /> : <Mic size={32} />) }
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground h-5">
              <StatusIcon className={cn('h-4 w-4', isSpinning && 'animate-spin')} />
              <span>{statusText}</span>
            </div>

            {transcription && (
               <div className="w-full text-left space-y-2 pt-4">
                  <Label>Your Command</Label>
                  <p className="text-sm italic text-foreground p-3 bg-muted rounded-md border">{transcription}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Text-to-Speech</CardTitle>
             <CardDescription>A utility to convert any text into high-quality speech.</CardDescription>
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
            <Button onClick={() => handleSpeak(textToSpeak)} disabled={isSpeaking || !textToSpeak || commandState !== 'idle'}>
              {isSpeaking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="mr-2 h-4 w-4" />
              )}
              Speak Text
            </Button>
             {ttsAudioUrl && commandState === 'idle' && (
                <div className="pt-4">
                  <Label>AI Voice Output</Label>
                  <audio src={ttsAudioUrl} controls className="w-full mt-2" />
                </div>
              )}
          </CardContent>
        </Card>
      </div>

       {agentResult && (
         <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                <Bot className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle>Agent Response</CardTitle>
                    <CardDescription>Here is the content generated from your voice command.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
            {agentResult.type === 'social' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="post-content">Post Content</Label>
                        <Textarea
                            id="post-content"
                            readOnly
                            value={agentResult.data.postContent}
                            className="h-40"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                        {agentResult.data.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary">#{tag}</Badge>
                        ))}
                        </div>
                </div>
            )}
            </CardContent>
         </Card>
      )}
    </div>
  );
}

    

    