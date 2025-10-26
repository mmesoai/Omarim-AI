
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
} from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


const mainNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/chat", icon: MessageCircle, label: "Omarim Chat" },
];

const featureNav = [
  { href: "/dashboard/agent", icon: Bot, label: "Autonomous Agent" },
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
  
  const NavAccordion = ({ title, items }: { title: string, items: typeof featureNav | typeof secondaryNav }) => (
    <Accordion type="single" collapsible className="w-full" defaultValue={items.some(item => pathname.startsWith(item.href)) ? title : undefined}>
      <AccordionItem value={title} className="border-none">
        <AccordionTrigger className="py-2 px-3 text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md group-data-[collapsible=icon]:hidden">
           {title}
        </AccordionTrigger>
        <AccordionContent className="pb-0 pl-4 group-data-[collapsible=icon]:hidden">
          <SidebarMenu className="py-2">
            {buildNav(items as typeof mainNav)}
          </SidebarMenu>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <SidebarMenu>
      {buildNav(mainNav)}
      <SidebarSeparator />
      <div className="px-2 space-y-1 group-data-[collapsible=icon]:hidden">
        <NavAccordion title="Features" items={featureNav} />
        <NavAccordion title="Tools" items={secondaryNav} />
      </div>
      
      {/* Icon-only display for collapsed sidebar */}
      <div className="hidden group-data-[collapsible=icon]:flex flex-col gap-1">
        <SidebarGroupLabel className="!mt-0">Features</SidebarGroupLabel>
        {buildNav(featureNav as typeof mainNav)}
        <SidebarSeparator />
        <SidebarGroupLabel>Tools</SidebarGroupLabel>
        {buildNav(secondaryNav as typeof mainNav)}
      </div>

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
