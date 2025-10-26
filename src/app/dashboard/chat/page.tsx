
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/icons";
import { Bot, Send, User } from "lucide-react";
import { interpretCommand } from "@/ai/flows/interpret-command";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const chatFormSchema = z.object({
  message: z.string().min(1, { message: "Message cannot be empty." }),
});

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: userData } = useDoc(userDocRef);
  const userName = userData ? userData.firstName : "User";

  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { message: "" },
  });

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  useEffect(() => {
    // Initial welcome message from the assistant
    setMessages([
      {
        id: "init",
        role: "assistant",
        content: `Hello ${userName}, I am Omarim AI. How can I help you today? You can ask me to generate content or manage your integrations.`,
      },
    ]);
  }, [userName]);

  const handleAiResponse = (action: string, prompt: string) => {
     let responseText = "";
     let navigationPath: string | null = null;

     switch (action) {
        case "generate_social_post":
            responseText = `Understood. I will generate a social media post about "${prompt}".`;
            navigationPath = `/dashboard/agent?agentType=social&prompt=${encodeURIComponent(prompt)}`;
            break;
        case "generate_outreach_email":
            responseText = `Got it. I will draft a personalized outreach email for the LinkedIn profile: ${prompt}.`;
            navigationPath = `/dashboard/agent?agentType=outreach&prompt=${encodeURIComponent(prompt)}`;
            break;
        case "add_store":
             responseText = `Perfect. Let's connect your ${prompt || 'new'} store. I'll take you to the right place.`;
             navigationPath = `/dashboard/settings?tab=integrations&action=addStore&storeType=${prompt || ''}`;
             break;
        default:
            responseText = "I'm sorry, I'm not sure how to help with that. I can help generate social media posts, draft outreach emails from LinkedIn profiles, or connect new stores.";
            break;
     }

     setMessages((prev) => [
        ...prev,
        { id: String(Date.now()), role: "assistant", content: responseText },
     ]);

     if (navigationPath) {
        setTimeout(() => router.push(navigationPath!), 1500);
     }
  }

  async function onSubmit(values: z.infer<typeof chatFormSchema>) {
    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content: values.message,
    };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    setIsThinking(true);

    try {
      const result = await interpretCommand({ command: values.message });
      handleAiResponse(result.action, result.prompt);
    } catch (error) {
      console.error("AI interpretation failed:", error);
      const errorMessage: Message = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: "Sorry, I had trouble understanding that. Please try rephrasing your command.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b">
          <CardTitle>Chat with Omarim AI</CardTitle>
          <CardDescription>Your personal AI assistant for managing your business.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={`flex items-start gap-4 ${
                        message.role === "user" ? "justify-end" : ""
                    }`}
                    >
                    {message.role === "assistant" && (
                        <Avatar className="h-9 w-9 border">
                        <div className="flex h-full w-full items-center justify-center bg-primary/10">
                            <Icons.logo className="h-5 w-5 text-primary" />
                        </div>
                        </Avatar>
                    )}
                    <div
                        className={`max-w-md rounded-lg px-4 py-3 text-sm ${
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                    >
                        <p>{message.content}</p>
                    </div>
                    {message.role === "user" && (
                        <Avatar className="h-9 w-9 border">
                        <AvatarFallback>
                            <User className="h-5 w-5" />
                        </AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                 {isThinking && (
                    <div className="flex items-start gap-4">
                        <Avatar className="h-9 w-9 border">
                            <div className="flex h-full w-full items-center justify-center bg-primary/10">
                                <Icons.logo className="h-5 w-5 text-primary" />
                            </div>
                        </Avatar>
                        <div className="max-w-md rounded-lg px-4 py-3 bg-muted flex items-center gap-2">
                           <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-0" />
                           <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-150" />
                           <span className="h-2 w-2 bg-primary rounded-full animate-pulse delay-300" />
                        </div>
                    </div>
                 )}
                </div>
            </ScrollArea>
        </CardContent>
        <div className="border-t p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex items-center gap-2"
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="e.g., 'Draft a social media post about our new smart watch'"
                        autoComplete="off"
                        {...field}
                        disabled={isThinking}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={isThinking}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
