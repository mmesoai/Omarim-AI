
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Bot,
  Building2,
  ChevronDown,
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
  Phone,
  LifeBuoy,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

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
  { href: "/dashboard/blueprints", icon: Package, label: "Blueprints" },
  { href: "/dashboard/ai-calls-agent", icon: LifeBuoy, label: "AI Calls Agent" },
];

const secondaryNav = [
  { href: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
  { href: "/dashboard/voice", icon: Mic, label: "Voice Tools" },
  { href: "/dashboard/new-site", icon: BotMessageSquare, label: "Intake Form" },
  { href: "/dashboard/customer-support", icon: Phone, label: "Customer Support" },
];

const NavGroup = ({
  label,
  navItems,
}: {
  label: string
  navItems: typeof mainNav
}) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(
    navItems.some((item) => pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard'))
  )

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md px-2 h-8 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent">
        {label}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="py-1 pl-4">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                  tooltip={item.label}
                  size="sm"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {mainNav.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}

      <SidebarSeparator />
      
      <NavGroup label="Features" navItems={featureNav} />

      <SidebarSeparator />

      <NavGroup label="Tools" navItems={secondaryNav} />

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
