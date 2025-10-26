
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
  Building2,
  FolderKanban,
  Home,
  Inbox,
  MessageCircle,
  Mic,
  Package,
  Send,
  Settings,
  BotMessageSquare,
  Share2,
  ShoppingBag,
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar"


const mainNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/chat", icon: MessageCircle, label: "Omarim Chat" },
];

const featureNav = [
  { href: "/dashboard/agent", icon: Bot, label: "Autonomous Agent" },
  { href: "/dashboard/digital-products", icon: ShoppingBag, label: "Digital Products" },
  { href: "/dashboard/leads", icon: FolderKanban, label: "Lead Intelligence" },
  { href: "/dashboard/outreach", icon: Send, label: "Outreach Engine" },
  { href: "/dashboard/stores", icon: Building2, label: "E-Commerce" },
  { href: "/dashboard/publisher", icon: Share2, label: "Social Publisher" },
  { href: "/dashboard/app-builder", icon: Package, label: "App Builder" },
];

const secondaryNav = [
  { href: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
  { href: "/dashboard/voice", icon: Mic, label: "Voice Tools" },
  { href: "/dashboard/new-site", icon: BotMessageSquare, label: "Intake Form" },
];


export function DashboardNav() {
  const pathname = usePathname()

  const buildNav = (items: typeof mainNav) => (
     items.map((item) => (
      <SidebarMenuItem key={item.href}>
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
    ))
  );

  return (
    <SidebarMenu>
      {buildNav(mainNav)}
      
      <SidebarSeparator />
      <SidebarGroupLabel>Features</SidebarGroupLabel>
      {buildNav(featureNav)}
      
      <SidebarSeparator />
      <SidebarGroupLabel>Tools</SidebarGroupLabel>
      {buildNav(secondaryNav)}

      <SidebarMenuItem className="mt-auto">
        <SidebarMenuButton
          asChild
          isActive={pathname.startsWith("/dashboard/settings")}
          tooltip="Settings"
        >
          <Link href="/dashboard/settings">
            <Settings />
            <span>Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
