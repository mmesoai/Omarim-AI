
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
import { Loader2, PlusCircle, Sparkles, Bot, TrendingUp, UserCheck, ShoppingCart, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateProductIdeas, type GenerateProductIdeasOutput } from "@/ai/flows/generate-product-ideas";
import { findTrendingProducts, type TrendingProduct } from "@/ai/tools/find-trending-products";
import { Separator } from "@/components/ui/separator";

const sourceColors: { [key: string]: string } = {
  Shopify: "bg-green-500/20 text-green-700 border-green-500/30",
  WooCommerce: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  Amazon: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  eBay: "bg-red-500/20 text-red-700 border-red-500/30",
}

const ideaFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters." }),
});

const trendingFormSchema = z.object({
  category: z.string().min(3, { message: "Category must be at least 3 characters." }),
});

export default function StoresPage() {
  const [isIdeaDialogOpen, setIsIdeaDialogOpen] = useState(false);
  const [isTrendingDialogOpen, setIsTrendingDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProducts, setGeneratedProducts] = useState<GenerateProductIdeasOutput['products'] | null>(null);
  const [trendingProduct, setTrendingProduct] = useState<TrendingProduct | null>(null);


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

  const trendingForm = useForm<z.infer<typeof trendingFormSchema>>({
    resolver: zodResolver(trendingFormSchema),
    defaultValues: {
      category: "kitchen gadgets",
    },
  });

  async function onIdeaSubmit(values: z.infer<typeof ideaFormSchema>) {
    setIsGenerating(true);
    setGeneratedProducts(null);
    try {
      const result = await generateProductIdeas({ topic: values.topic });
      setGeneratedProducts(result.products);
      setTrendingProduct(null); // Clear other results
    } catch (error) {
      console.error("Failed to generate product ideas:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate product ideas.",
      });
    } finally {
      setIsGenerating(false);
      setIsIdeaDialogOpen(false);
      ideaForm.reset();
    }
  }

  async function onTrendingSubmit(values: z.infer<typeof trendingFormSchema>) {
    setIsGenerating(true);
    setTrendingProduct(null);
    try {
      const result = await findTrendingProducts({ category: values.category });
      setTrendingProduct(result);
      setGeneratedProducts(null); // Clear other results
    } catch (error) {
      console.error("Failed to find trending products:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not analyze the product category.",
      });
    } finally {
      setIsGenerating(false);
      setIsTrendingDialogOpen(false);
      trendingForm.reset();
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-headline font-semibold">Product Sourcing</h2>
          <p className="text-muted-foreground">
            Aggregate products from your stores or let the AI find new opportunities.
          </p>
        </div>
        <div className="flex gap-2">
            <Dialog open={isIdeaDialogOpen} onOpenChange={setIsIdeaDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
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
            <Dialog open={isTrendingDialogOpen} onOpenChange={setIsTrendingDialogOpen}>
              <DialogTrigger asChild>
                 <Button>
                  <Bot className="mr-2 h-4 w-4" />
                  Autonomous Sourcing
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Autonomous Product Sourcing</DialogTitle>
                  <DialogDescription>
                    Let the AI analyze a market and find a trending product opportunity.
                  </DialogDescription>
                </DialogHeader>
                <Form {...trendingForm}>
                  <form onSubmit={trendingForm.handleSubmit(onTrendingSubmit)} className="space-y-4">
                    <FormField
                      control={trendingForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 'kitchen gadgets'" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={isGenerating}>
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Analyze Market
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
        </div>
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

      {trendingProduct && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
             <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Autonomous Sourcing Report</CardTitle>
                <CardDescription>AI analysis of a trending product opportunity.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-headline text-2xl font-bold text-foreground">{trendingProduct.productName}</h3>
                    <p className="text-sm text-muted-foreground">{trendingProduct.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-medium">Price Point:</span>
                            <span className="text-foreground">${trendingProduct.estimatedSalePrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-primary" />
                            <span className="font-medium">Target Audience:</span>
                            <span className="text-foreground">{trendingProduct.targetAudience}</span>
                        </div>
                    </div>
                </div>
                <Card className="bg-card/80">
                    <CardHeader>
                        <CardTitle className="text-base">Supplier Intel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="font-semibold">{trendingProduct.supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{trendingProduct.supplier.contactEmail}</p>
                         <Button className="w-full mt-2" variant="outline">
                            <Mail className="mr-2 h-4 w-4"/>
                            Contact Supplier
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <Separator />
            <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary"/> Marketing Angle</h4>
                <p className="mt-2 text-sm text-muted-foreground">{trendingProduct.marketingAngle}</p>
                <div className="mt-4 flex gap-2">
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Add Product & Promote</Button>
                    <Button variant="secondary">Launch Campaign</Button>
                </div>
            </div>
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
