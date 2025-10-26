
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const productsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/products`);
  }, [firestore, user]);

  const { data: products, isLoading } = useCollection(productsCollectionRef);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
          <CardDescription>A real-time look at your product quantities across all sources.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex h-80 w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && products && products.length > 0 && (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={products}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      borderColor: 'hsl(var(--border))'
                    }}
                   />
                  <Legend />
                  <Bar dataKey="quantity" fill="hsl(var(--primary))" name="Stock Quantity" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="price" fill="hsl(var(--accent))" name="Price" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
           {!isLoading && (!products || products.length === 0) && (
            <div className="flex h-80 w-full items-center justify-center">
              <p className="text-muted-foreground">No product data available. Add products in the 'Product Sourcing' page to see the chart.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
