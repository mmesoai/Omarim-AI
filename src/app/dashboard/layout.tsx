"use client"

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { Icons } from "@/components/icons";
import { useAuth, useUser, useFirestore, useDoc } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const userDocRef = user ? doc(firestore, "users", user.uid) : null;
  const { data: userData } = useDoc(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const handleLogout = () => {
    signOut(auth);
    router.push("/login");
  };

  const userInitial = userData ? userData.firstName.charAt(0).toUpperCase() : "";
  const userName = userData ? `${userData.firstName} ${userData.lastName}` : "User";

  if (isUserLoading || !user) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="h-16 items-center justify-center p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icons.logo className="size-6 text-sidebar-primary" />
            <span className="font-headline text-lg font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Omarim AI
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 w-full justify-start gap-2 px-2 group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || ""} alt={userName} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <span className="group-data-[collapsible=icon]:hidden">
                  {userName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="relative isolate flex h-full min-h-svh flex-col">
          <Image
            src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop"
            alt="Futuristic background"
            fill
            className="-z-10 object-cover opacity-20"
            data-ai-hint="abstract space"
          />
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-transparent px-4 md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h1 className="font-headline text-lg font-semibold md:text-xl">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg bg-white/5 pl-8 text-foreground"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ""} alt={userName} />
                      <AvatarFallback>{userInitial}</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
