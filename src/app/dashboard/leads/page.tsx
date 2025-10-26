"use client"

import { useUser, useFirestore, useCollection, addDocumentNonBlocking, useMemoFirebase } from "@/firebase";
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
import { PlusCircle, Loader2 } from "lucide-react";

export default function LeadsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  // IMPORTANT: The path `/users/${user.uid}/leads` is a placeholder.
  // According to backend.json, it should be `/users/{userId}/notionPages/{notionPageId}/leads/{leadId}`
  // For simplicity in this step, we will use a top-level `leads` sub-collection.
  // We will need to address the full path when Notion integration is built.
  const leadsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // For now, we'll use a simplified path. We can update this later.
    return collection(firestore, `users/${user.uid}/leads`);
  }, [firestore, user]);

  const { data: leads, isLoading } = useCollection(leadsCollectionRef);

  const handleScrapeNewLead = () => {
    if (!leadsCollectionRef) return;
    
    // This is a placeholder for a real scraping mechanism.
    // It adds a sample lead to the user's collection in Firestore.
    const sampleLead = {
      firstName: "Alex",
      lastName: "Morgan",
      company: "Innovate Inc.",
      domain: "innovate.com",
      email: `alex.morgan_${Date.now()}@innovate.com`,
      status: "New",
      notionPageId: "placeholder_page_id", // Placeholder
    };
    addDocumentNonBlocking(leadsCollectionRef, sampleLead);
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
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
                      lead.status === "Replied" ? "default" :
                      lead.status === "New" ? "secondary" : 
                      lead.status === "Not Interested" ? "destructive" : "outline"
                    }
                    className={
                      lead.status === "Interested" ? 'bg-green-500/80 hover:bg-green-500' :
                      lead.status === "Replied" ? 'bg-blue-500/80 hover:bg-blue-500' : ''
                    }
                    >
                      {lead.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!leads || leads.length === 0) && (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
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
