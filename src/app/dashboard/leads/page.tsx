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
import { PlusCircle } from "lucide-react";

const leads = [
  { name: "John Doe", company: "Innovate Inc.", email: "john.d@innovate.com", status: "Contacted" },
  { name: "Jane Smith", company: "Solutions Corp.", email: "jane.s@solutions.co", status: "New" },
  { name: "Peter Jones", company: "TechForward", email: "peter.j@techforward.io", status: "Replied" },
  { name: "Mary Johnson", company: "Data-Driven LLC", email: "mary@datadriven.com", status: "Interested" },
  { name: "David Williams", company: "CloudNine", email: "d.williams@cloudnine.net", status: "New" },
  { name: "Sarah Brown", company: "QuantumLeap", email: "s.brown@quantumleap.ai", status: "Not Interested" },
  { name: "Michael Davis", company: "NextGen Systems", email: "m.davis@nextgen.sys", status: "Contacted" },
];

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold">Lead Scrape</h2>
          <p className="text-muted-foreground">
            Manage and scrape new leads to fill your pipeline.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Scrape New Leads
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>
            A list of recently scraped leads.
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
              {leads.map((lead) => (
                <TableRow key={lead.email}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
