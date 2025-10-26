
"use client";

import Image from "next/image"
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
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Loader2 } from "lucide-react";


const sourceColors: { [key: string]: string } = {
  Shopify: "bg-green-500/20 text-green-700 border-green-500/30",
  WooCommerce: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  Amazon: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  eBay: "bg-red-500/20 text-red-700 border-red-500/30",
}

export default function StoresPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const productsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/products`);
  }, [firestore, user]);

  const { data: products, isLoading } = useCollection(productsCollectionRef);


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-headline font-semibold">Product Sourcing</h2>
        <p className="text-muted-foreground">
          Aggregate product listings from your connected stores.
        </p>
      </div>
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

