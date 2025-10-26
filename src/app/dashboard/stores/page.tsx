
"use client";

import { useState } from "react";
import Image from "next/image"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Loader2, PlusCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateProductIdeas, type GenerateProductIdeasOutput } from "@/ai/flows/generate-product-ideas";

const sourceColors: { [key: string]: string } = {
  Shopify: "bg-green-500/20 text-green-700 border-green-500/30",
  WooCommerce: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  Amazon: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  eBay: "bg-red-500/20 text-red-700 border-red-500/30",
}

const ideaFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
});

export default function StoresPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProducts, setGeneratedProducts] = useState<GenerateProductIdeasOutput['products'] | null>(null);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const productsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/products`);
  }, [firestore, user]);

  const { data: products, isLoading } = useCollection(productsCollectionRef);

  const ideaForm = useForm<z.infer<typeof ideaFormSchema>>({
    resolver: zodResolver(ideaFormSchema),
    defaultValues: {
      topic: "eco-friendly home goods",
    },
  });

  async function onIdeaSubmit(values: z.infer<typeof ideaFormSchema>) {
    setIsGenerating(true);
    setGeneratedProducts(null);
    try {
      const result = await generateProductIdeas({ topic: values.topic });
      setGeneratedProducts(result.products);
    } catch (error) {
      console.error("Failed to generate product ideas:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate product ideas.",
      });
    } finally {
      setIsGenerating(false);
      setIsDialogOpen(false);
      ideaForm.reset();
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-headline font-semibold">Product Sourcing</h2>
          <p className="text-muted-foreground">
            Aggregate product listings from your connected stores or generate new ideas.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Ideas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>AI Product Idea Generator</DialogTitle>
              <DialogDescription>
                Enter a topic and let AI generate product ideas for you.
              </DialogDescription>
            </DialogHeader>
            <Form {...ideaForm}>
              <form onSubmit={ideaForm.handleSubmit(onIdeaSubmit)} className="space-y-4">
                <FormField
                  control={ideaForm.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'summer outdoor gear'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isGenerating && (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {generatedProducts && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>AI Generated Ideas</CardTitle>
            <CardDescription>
              Here are some product ideas generated by the AI. You can add them to your store.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {generatedProducts.map((product, index) => {
              const image = PlaceHolderImages.find(p => p.id === product.imageId);
              return (
                 <Card key={index} className="overflow-hidden bg-card/80">
                  <CardHeader className="p-0">
                    <div className="relative aspect-[3/2] w-full">
                      {image ? (
                        <Image
                          src={image.imageUrl}
                          alt={image.description}
                          fill
                          className="object-cover"
                          data-ai-hint={image.imageHint}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-base font-semibold leading-tight">{product.name}</CardTitle>
                     <p className="text-sm text-muted-foreground mt-1 h-10 overflow-hidden">{product.description}</p>
                    <p className="mt-2 text-xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </p>
                    <Button className="w-full mt-4" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add to Products</Button>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}


       <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>
            A real-time list of your products from your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />}
          
          {!isLoading && (!products || products.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              You have no products yet. Connect a store to get started.
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {!isLoading && products && products.map((product) => {
              const image = PlaceHolderImages.find(p => p.id === product.imageId);
              return (
                <Card key={product.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative aspect-[3/2] w-full">
                      {image ? (
                        <Image
                          src={image.imageUrl}
                          alt={image.description}
                          fill
                          className="object-cover"
                          data-ai-hint={image.imageHint}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-semibold leading-tight">{product.name}</CardTitle>
                      <Badge
                        variant="outline"
                        className={`ml-2 whitespace-nowrap ${sourceColors[product.source] || ""}`}
                      >
                        {product.source}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xl font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
