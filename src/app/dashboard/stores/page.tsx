import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const products = [
  { id: "1", name: "Smart Watch Series 8", price: 399.00, source: "Shopify", imageId: "product1" },
  { id: "2", name: "Noise Cancelling Headphones", price: 249.00, source: "WooCommerce", imageId: "product2" },
  { id: "3", name: "Pro Laptop 14-inch", price: 1999.00, source: "Amazon", imageId: "product3" },
  { id: "4", name: "Mirrorless Camera Alpha", price: 899.00, source: "eBay", imageId: "product4" },
  { id: "5", name: "Ergonomic Office Chair", price: 450.00, source: "Shopify", imageId: "product5" },
  { id: "6", name: "VR Headset Nova", price: 599.00, source: "Amazon", imageId: "product6" },
  { id: "7", name: "Smart Home Hub", price: 129.00, source: "WooCommerce", imageId: "product7" },
  { id: "8", name: "Electric Commuter Scooter", price: 699.00, source: "eBay", imageId: "product8" },
]

const sourceColors: { [key: string]: string } = {
  Shopify: "bg-green-500/20 text-green-700 border-green-500/30",
  WooCommerce: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  Amazon: "bg-orange-500/20 text-orange-700 border-orange-500/30",
  eBay: "bg-red-500/20 text-red-700 border-red-500/30",
}

export default function StoresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-headline font-semibold">Product Sourcing</h2>
        <p className="text-muted-foreground">
          Aggregate product listings from your connected stores.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const image = PlaceHolderImages.find(p => p.id === product.imageId);
          return (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative aspect-[3/2] w-full">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      fill
                      className="object-cover"
                      data-ai-hint={image.imageHint}
                    />
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
    </div>
  );
}
