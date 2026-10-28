'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { Zap, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      loginSchema.parse({ email, password });
      setIsLoading(true);

      const res = await signIn(email, password);
      setIsLoading(false);

      if (res.error) {
        toast.error(res.error);
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setIsLoading(false);
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      }
    }
  };

  const handleQuickDemoLogin = async (asAdmin: boolean) => {
    setIsLoading(true);
    const demoEmail = asAdmin ? 'admin@cryptopulse.io' : 'investor@cryptopulse.io';
    await signIn(demoEmail, 'Password123!');
    setIsLoading(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mb-2">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back to CryptoPulse</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access real-time markets, your portfolio & live alerts.
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-card/80 backdrop-blur border-border/80 shadow-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription>Enter your email and password below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                <Input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full gap-2 font-semibold" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </form>

          {/* Quick Demo Access (1-Click) */}
          <div className="px-6 pb-6 pt-2">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold">
                  Instant Demo Access
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9"
                onClick={() => handleQuickDemoLogin(true)}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Admin Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-9"
                onClick={() => handleQuickDemoLogin(false)}
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                User Demo
              </Button>
            </div>
          </div>

          <CardFooter className="border-t pt-4 text-center justify-center text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline ml-1">
              Create account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
