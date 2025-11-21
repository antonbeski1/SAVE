'use client';

import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black">
      <Card className="mx-auto max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_25px_rgba(255,255,255,0.15)]">
        <CardHeader className="text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <LifeBuoy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">SAVE</h1>
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your email below to receive a one-time password</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required className="bg-transparent placeholder:text-gray-400" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="otp">One-Time Password</Label>
              </div>
              <div className="flex gap-2">
                <Input id="otp" required className="bg-transparent placeholder:text-gray-400"/>
                <Button variant="secondary" className="bg-white text-black hover:bg-gray-200 shadow-[0_0_8px_rgba(255,255,255,0.3)]">Send OTP</Button>
              </div>
            </div>
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">Log in</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
