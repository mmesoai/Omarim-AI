"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  domain: z.string().min(3, {
    message: "Domain must be at least 3 characters.",
  }).regex(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, {
    message: "Please enter a valid domain name.",
  }),
});

export default function NewSitePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [domainChecked, setDomainChecked] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsSubmitted(false);
    setDomainChecked(values.domain);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-headline font-semibold">New Site Intake</h2>
        <p className="text-muted-foreground">
          Start by checking for your desired domain name.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Domain Check</CardTitle>
            <CardDescription>
              Enter a domain to see if it&apos;s available.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain Name</FormLabel>
                      <FormControl>
                        <Input placeholder="example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Check Availability
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {isSubmitted && (
          <Card>
            <CardHeader>
              <CardTitle>Provisioning Options</CardTitle>
              <CardDescription>
                The domain <span className="font-semibold text-primary">{domainChecked}</span> is available! Choose a plan to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="standard" className="grid gap-4">
                <Label
                  htmlFor="standard"
                  className="flex cursor-pointer items-center space-x-2 rounded-md border p-4 hover:bg-accent has-[[data-state=checked]]:border-primary"
                >
                  <RadioGroupItem value="standard" id="standard" />
                  <div>
                    <p className="font-semibold">Standard Site</p>
                    <p className="text-sm text-muted-foreground">$99/month - Includes hosting, basic SEO, and 5 pages.</p>
                  </div>
                </Label>
                <Label
                  htmlFor="ecommerce"
                  className="flex cursor-pointer items-center space-x-2 rounded-md border p-4 hover:bg-accent has-[[data-state=checked]]:border-primary"
                >
                  <RadioGroupItem value="ecommerce" id="ecommerce" />
                  <div>
                    <p className="font-semibold">E-commerce Store</p>
                    <p className="text-sm text-muted-foreground">$249/month - Includes everything in Standard + online store setup.</p>
                  </div>
                </Label>
                <Label
                  htmlFor="enterprise"
                  className="flex cursor-pointer items-center space-x-2 rounded-md border p-4 hover:bg-accent has-[[data-state=checked]]:border-primary"
                >
                  <RadioGroupItem value="enterprise" id="enterprise" />
                   <div>
                    <p className="font-semibold">Enterprise Solution</p>
                    <p className="text-sm text-muted-foreground">Contact Us - Custom solution with dedicated support.</p>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
            <CardFooter>
                <Button>
                    Proceed to Payment
                </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
