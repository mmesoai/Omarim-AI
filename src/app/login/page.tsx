"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useAuth, useUser, initiateEmailSignIn, initiateGoogleSignIn } from "@/firebase"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
})

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const { user, isUserLoading } = useUser()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isUserLoading, router])

  function onSubmit(values: z.infer<typeof formSchema>) {
    initiateEmailSignIn(auth, values.email, values.password)
  }

  function onGoogleSignIn() {
    initiateGoogleSignIn(auth);
  }

  if (isUserLoading || user) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
       <div className="absolute top-4 left-4 flex items-center gap-2 text-white z-10">
        <Icons.logo className="h-8 w-8" />
        <span className="font-headline text-xl font-bold">Omarim AI</span>
      </div>
      <Image
        src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop"
        alt="Futuristic background"
        fill
        className="object-cover opacity-40"
        data-ai-hint="abstract space"
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm border-white/20">
            <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icons.logo className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
            <CardDescription>
                Enter your email below to login to your account
            </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button variant="outline" onClick={onGoogleSignIn}>
                    <Icons.google className="mr-2 h-4 w-4" />
                    Sign in with Google
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                </div>
            </CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <CardContent className="grid gap-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                <Button className="w-full" type="submit">Login with Email</Button>
                <div className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline hover:text-primary">
                    Sign up
                    </Link>
                </div>
                </CardFooter>
            </form>
            </Form>
        </Card>
      </div>
    </div>
  )
}
