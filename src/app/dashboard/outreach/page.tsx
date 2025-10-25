import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle } from "lucide-react";

const sequences = [
  {
    title: "New Lead Welcome Sequence",
    recipients: 523,
    openRate: 68,
    replyRate: 12,
    status: "Active",
  },
  {
    title: "Q4 Promotion",
    recipients: 1250,
    openRate: 45,
    replyRate: 5,
    status: "Active",
  },
  {
    title: "Cold Outreach - Tech Startups",
    recipients: 800,
    openRate: 22,
    replyRate: 2,
    status: "Paused",
  },
  {
    title: "Past Customers Re-engagement",
    recipients: 340,
    openRate: 75,
    replyRate: 25,
    status: "Draft",
  },
];

export default function OutreachPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold">Outreach Sequences</h2>
          <p className="text-muted-foreground">
            Create and manage your automated email campaigns.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Sequence
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sequences.map((sequence) => (
          <Card key={sequence.title} className="flex flex-col">
            <CardHeader>
              <CardTitle>{sequence.title}</CardTitle>
              <CardDescription>{sequence.recipients.toLocaleString()} recipients</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Open Rate</span>
                  <span className="font-medium">{sequence.openRate}%</span>
                </div>
                <Progress value={sequence.openRate} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Reply Rate</span>
                  <span className="font-medium">{sequence.replyRate}%</span>
                </div>
                <Progress value={sequence.replyRate} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <span className={`text-sm font-medium ${
                sequence.status === 'Active' ? 'text-green-500' :
                sequence.status === 'Paused' ? 'text-yellow-500' : 'text-muted-foreground'
              }`}>
                {sequence.status}
              </span>
              <Button variant="secondary">View Details</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
