"use client"

import * as React from "react"
import { mails, type Mail } from "@/app/dashboard/inbox/data"
import { MailDisplay } from "@/app/dashboard/inbox/components/mail-display"
import { MailList } from "@/app/dashboard/inbox/components/mail-list"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function InboxPage() {
  const [selectedMailId, setSelectedMailId] = React.useState<string | null>(mails[0].id)

  const selectedMail = mails.find((item) => item.id === selectedMailId) || null

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="w-full md:w-1/3 lg:w-1/4 border-r">
        <ScrollArea className="h-full">
          <MailList 
            items={mails} 
            selected={selectedMailId}
            onSelect={setSelectedMailId} 
          />
        </ScrollArea>
      </div>
      <div className="hidden md:flex w-full md:w-2/3 lg:w-3/4">
        <MailDisplay mail={selectedMail} />
      </div>
    </div>
  )
}
