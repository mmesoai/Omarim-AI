
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { initiateOutreach } from "@/app/actions";
import type { QualifiedLead } from "@/ai/tools/find-and-qualify-leads";

export default function LeadsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const leadsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/leads`);
  }, [firestore, user]);

  const { data: leads, isLoading } = useCollection(leadsCollectionRef);

  
  const handleInitiateEmail = async (lead: any) => {
    if (!user || !lead.id) return;
    
    toast({
      title: "Engaging Lead...",
      description: `Preparing to contact ${lead.firstName}...`,
    });

    const qualifiedLeadForFlow: QualifiedLead = {
      name: `${lead.firstName} ${lead.lastName}`,
      company: lead.company,
      email: lead.email,
      title: lead.title || 'Decision Maker', 
      industry: lead.industry || 'Unknown',
      qualificationReason: 'Follow-up from existing lead pipeline.',
      hasWebsite: !!lead.domain,
    }

    try {
        const result = await initiateOutreach({ userId: user.uid, lead: qualifiedLeadForFlow });
        
        toast({
            title: result.success ? 'Engagement Successful!' : 'Engagement Failed',
            description: result.message,
            variant: result.success ? 'default' : 'destructive',
        });

    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Action Failed',
            description: error.message || 'Could not complete the engagement process.',
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold">Lead Management</h2>
          <p className="text-muted-foreground">
            Manage your leads and initiate outreach campaigns.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Leads</CardTitle>
          <CardDescription>
            A real-time list of your leads from your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && leads && leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.firstName} {lead.lastName}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      lead.status === "Interested" ? "default" : 
                      lead.status === "Contacted" ? "default" : 
                      lead.status === "Replied" ? "default" : 
                      lead.status === "New" ? "secondary" : 
                      lead.status === "Not Interested" ? "destructive" : "outline"
                    }
                    className={
                      lead.status === "Interested" ? 'bg-green-500 hover:bg-green-500/90' :
                      lead.status === "Contacted" ? 'bg-blue-500 hover:bg-blue-500/90' :
                      lead.status === "Replied" ? 'bg-yellow-500 hover:bg-yellow-500/90 text-black' : ''
                    }
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleInitiateEmail(lead)} disabled={lead.status === 'Contacted'}>
                      <Mail className="h-4 w-4" />
                      <span className="sr-only">Initiate Email</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!leads || leads.length === 0) && (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    You have no leads yet. Let the autonomous agent find some for you.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
