
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser, useFirestore, useCollection, addDocumentNonBlocking, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

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
import { Loader2, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const sequenceFormSchema = z.object({
  name: z.string().min(5, { message: "Sequence name must be at least 5 characters." }),
  description: z.string().optional(),
});

export default function OutreachPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const sequencesCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/outreachSequences`);
  }, [firestore, user]);

  const { data: sequences, isLoading } = useCollection(sequencesCollectionRef);

  const sequenceForm = useForm<z.infer<typeof sequenceFormSchema>>({
    resolver: zodResolver(sequenceFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSequenceSubmit(values: z.infer<typeof sequenceFormSchema>) {
    if (!sequencesCollectionRef) return;
    
    const newSequence = {
      name: values.name,
      description: values.description || "",
      recipients: 0,
      openRate: 0,
      replyRate: 0,
      status: "Draft",
      leadIds: [],
    };

    addDocumentNonBlocking(sequencesCollectionRef, newSequence);
    toast({
      title: "Sequence Created",
      description: `The "${values.name}" sequence has been created as a draft.`,
    });
    sequenceForm.reset();
    setIsDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold">Outreach Sequences</h2>
          <p className="text-muted-foreground">
            Create and manage your automated email campaigns.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Sequence
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Outreach Sequence</DialogTitle>
              <DialogDescription>
                Configure a new automated email campaign.
              </DialogDescription>
            </DialogHeader>
            <Form {...sequenceForm}>
              <form onSubmit={sequenceForm.handleSubmit(onSequenceSubmit)} className="space-y-4">
                <FormField
                  control={sequenceForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sequence Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New Lead Welcome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sequenceForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What is this sequence for?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">Create Sequence</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />}

      {!isLoading && (!sequences || sequences.length === 0) && (
        <Card className="flex items-center justify-center py-20">
          <div className="text-center">
            <h3 className="text-lg font-semibold">No sequences yet</h3>
            <p className="text-muted-foreground">Create your first outreach sequence to get started.</p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {!isLoading && sequences && sequences.map((sequence) => (
          <Card key={sequence.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{sequence.name}</CardTitle>
              <CardDescription>{(sequence.recipients || 0).toLocaleString()} recipients</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Open Rate</span>
                  <span className="font-medium">{sequence.openRate || 0}%</span>
                </div>
                <Progress value={sequence.openRate || 0} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span>Reply Rate</span>
                  <span className="font-medium">{sequence.replyRate || 0}%</span>
                </div>
                <Progress value={sequence.replyRate || 0} />
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
