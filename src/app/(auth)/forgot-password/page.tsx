'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { Zap, ArrowLeft, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      forgotPasswordSchema.parse({ email });
      setIsLoading(true);

      const res = await resetPassword(email);
      setIsLoading(false);

      if (res.error) {
        toast.error(res.error);
      } else {
        setIsSubmitted(true);
        toast.success(res.message || 'Reset link sent!');
      }
    } catch (err: any) {
      setIsLoading(false);
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mb-2">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            We will send a password reset link to your verified email.
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur border-border/80 shadow-md">
          {isSubmitted ? (
            <div className="p-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
                <MailCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Check your email</h3>
              <p className="text-xs text-muted-foreground">
                We sent instructions to <strong>{email}</strong>. Follow the link in that email to reset your password.
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-lg">Forgot Password</CardTitle>
                <CardDescription>Enter your account email below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                  <Input
                    type="email"
                    placeholder="sarah@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                  {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                </Button>
              </CardContent>
              <CardFooter className="border-t pt-4 text-center justify-center text-xs text-muted-foreground">
                <Link href="/login" className="flex items-center gap-1 text-primary hover:underline">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
