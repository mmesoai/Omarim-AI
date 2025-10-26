
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart2,
  BotMessageSquare,
  Building2,
  FolderKanban,
  Home,
  Inbox,
  MessageCircle,
  Mic,
  Send,
  Settings,
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/chat", icon: MessageCircle, label: "Chat" },
  { href: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
  { href: "/dashboard/leads", icon: FolderKanban, label: "Lead Scrape" },
  { href: "/dashboard/outreach", icon: Send, label: "Outreach" },
  { href: "/dashboard/new-site", icon: BotMessageSquare, label: "Intake Form" },
  { href: "/dashboard/stores", icon: Building2, label: "Product Sourcing" },
  { href: "/dashboard/voice", icon: Mic, label: "Voice Tools" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", separate: true },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href} className={item.separate ? "mt-auto" : ""}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

    