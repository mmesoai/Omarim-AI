
"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react"

import type { Mail } from "@/app/dashboard/inbox/data"
import {
  classifyInboundReply,
  type ClassifyInboundReplyOutput,
} from "@/ai/flows/classify-inbound-replies"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface MailDisplayProps {
  mail: Mail | null
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const [aiAnalysis, setAiAnalysis] = useState<ClassifyInboundReplyOutput | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (mail) {
      const analyzeMail = async () => {
        setIsLoading(true)
        setAiAnalysis(null)
        try {
          const result = await classifyInboundReply({ emailBody: mail.text })
          setAiAnalysis(result)
        } catch (error) {
          console.error("AI analysis failed:", error)
          toast({
            variant: "destructive",
            title: "AI Analysis Failed",
            description: "Could not analyze the email.",
          })
        } finally {
          setIsLoading(false)
        }
      }
      analyzeMail()
    }
  }, [mail, toast])

  return (
    <div className="flex h-full flex-col">
      {mail ? (
        <>
          <div className="flex items-center p-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ArchiveX className="h-4 w-4" />
                <span className="sr-only">Move to junk</span>
              </Button>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </div>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={!mail}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                <DropdownMenuItem>Star thread</DropdownMenuItem>
                <DropdownMenuItem>Add label</DropdownMenuItem>
                <DropdownMenuItem>Mute thread</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Separator />
          <div className="flex flex-1 flex-col">
            <div className="flex items-start p-4">
              <div className="flex items-start gap-4 text-sm">
                <Avatar>
                  <AvatarImage alt={mail.name} />
                  <AvatarFallback>
                    {mail.name
                      .split(" ")
                      .map((chunk) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <div className="font-semibold">{mail.name}</div>
                  <div className="line-clamp-1 text-xs">{mail.subject}</div>
                  <div className="line-clamp-1 text-xs">
                    <span className="font-medium">Reply-To:</span>{" "}
                    <span className="text-muted-foreground">{mail.email}</span>
                  </div>
                </div>
              </div>
              {mail.date && (
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(mail.date), "PPpp")}
                </div>
              )}
            </div>
            <Separator />
            <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
              {mail.text}
            </div>
            <Separator className="mt-auto" />
            <div className="p-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">AI Analysis</h3>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-1/4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                    </div>
                  ) : aiAnalysis ? (
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Sentiment:</span>{" "}
                        <span className="capitalize text-muted-foreground">{aiAnalysis.sentiment}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Category:</span>{" "}
                        <span className="capitalize text-muted-foreground">{aiAnalysis.category}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Tags:</span>
                        {aiAnalysis.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No analysis available.</p>
                  )}
                </div>
                <Textarea
                  className="p-4"
                  placeholder={`Reply to ${mail.name}...`}
                />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal"
                  >
                  </Label>
                  <Button size="sm" className="ml-auto">
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  )
}
