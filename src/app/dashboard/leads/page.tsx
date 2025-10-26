
"use client"

import { useUser, useFirestore, useCollection, addDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
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
import { PlusCircle, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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

  const handleScrapeNewLead = () => {
    if (!leadsCollectionRef) return;
    
    const sampleLead = {
      firstName: "Alex",
      lastName: "Morgan",
      company: "Innovate Inc.",
      domain: "innovate.com",
      email: `alex.morgan_${Date.now()}@innovate.com`,
      status: "New",
      notionPageId: "placeholder_page_id",
    };
    addDocumentNonBlocking(leadsCollectionRef, sampleLead);
  };
  
  const handleDraftEmail = (lead: any) => {
    if (!user || !firestore || !lead.id) return;
    
    // Update the lead's status to 'Contacted' in a non-blocking way
    const leadDocRef = doc(firestore, `users/${user.uid}/leads`, lead.id);
    updateDocumentNonBlocking(leadDocRef, { status: 'Contacted' });

    toast({
      title: "Status Updated",
      description: `${lead.firstName} ${lead.lastName} has been marked as 'Contacted'.`,
    });
    
    // Redirect to the agent page to draft the email
    const mockLinkedInUrl = `https://www.linkedin.com/in/${lead.firstName.toLowerCase()}${lead.lastName.toLowerCase()}`;
    router.push(`/dashboard/agent?agentType=outreach&prompt=${encodeURIComponent(mockLinkedInUrl)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold">Lead Scrape</h2>
          <p className="text-muted-foreground">
            Manage and scrape new leads to fill your pipeline.
          </p>
        </div>
        <Button onClick={handleScrapeNewLead} disabled={!user || isLoading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Scrape New Lead
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Leads</CardTitle>
          <CardDescription>
            A real-time list of your scraped leads from your database.
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
                  <TableCell colSpan={5} className="text-center">
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
                      lead.status === "Interested" ? 'bg-green-500/80 hover:bg-green-500' :
                      lead.status === "Contacted" ? 'bg-blue-500/80 hover:bg-blue-500' :
                      lead.status === "Replied" ? 'bg-yellow-500/80 hover:bg-yellow-500' : ''
                    }
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDraftEmail(lead)}>
                      <Mail className="h-4 w-4" />
                      <span className="sr-only">Draft Email</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!leads || leads.length === 0) && (
                 <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    You have no leads yet. Try scraping one!
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
