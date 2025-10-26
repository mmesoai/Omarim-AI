
"use client"

import Link from "next/link";
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
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";
import { DashboardNav } from "@/components/dashboard-nav";
import { Icons } from "@/components/icons";
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc } from "firebase/firestore";

const Header = () => {
    const { user } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, "users", user.uid);
    }, [user, firestore]);

    const { data: userData } = useDoc(userDocRef);
    const auth = useAuth();
    const handleLogout = () => { signOut(auth) };

    const userInitial = userData?.firstName ? userData.firstName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || "U");
    const userName = userData ? `${userData.firstName} ${userData.lastName}` : (user?.email || "User");

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <div className="flex items-center gap-2" />
            <div className="flex items-center gap-4">
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
    );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ); 
  }

  if (!user) {
    return null; // Don't render the dashboard if there's no user. The useEffect will redirect.
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="h-16 flex items-center justify-center p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icons.logo className="size-7 text-sidebar-primary" />
            <span className="font-headline text-xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Omarim AI
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
