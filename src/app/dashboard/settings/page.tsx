import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-headline font-semibold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Make changes to your public information here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" disabled/>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>
                Manage your billing information and view your invoices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="font-medium">Current Plan: <span className="text-primary">E-commerce</span></p>
                <p className="text-sm text-muted-foreground">Your next billing date is on the 1st of next month.</p>
                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="flex items-center justify-between rounded-md border p-4">
                        <p>Visa ending in 1234</p>
                        <Button variant="outline">Update</Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary">View Invoices</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect your accounts from other services.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between rounded-md border p-4">
                    <p className="font-medium">Shopify</p>
                    <Button variant="secondary">Connect</Button>
                </div>
                <div className="flex items-center justify-between rounded-md border p-4">
                    <p className="font-medium">WooCommerce</p>
                    <Button variant="secondary">Connect</Button>
                </div>
                <div className="flex items-center justify-between rounded-md border p-4">
                    <p className="font-medium">SendGrid</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-green-500">Connected</p>
                      <Button variant="outline">Disconnect</Button>
                    </div>
                </div>
                 <div className="flex items-center justify-between rounded-md border p-4">
                    <p className="font-medium">Clearbit</p>
                     <div className="flex items-center gap-2">
                      <p className="text-sm text-green-500">Connected</p>
                      <Button variant="outline">Disconnect</Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
