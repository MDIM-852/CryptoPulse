'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/formatters';
import { profileUpdateSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { User, Shield, Calendar, Trash2, Save, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const { user, role, updateProfile, deleteAccount, resetPassword } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const initials = (user.full_name || user.email)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      profileUpdateSchema.parse({
        full_name: fullName,
        avatar_url: avatarUrl || '',
      });

      setIsUpdating(true);
      const res = await updateProfile(fullName, avatarUrl);
      setIsUpdating(false);

      if (res.error) {
        toast.error(res.error);
      }
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      }
    }
  };

  const handlePasswordReset = async () => {
    const res = await resetPassword(user.email);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || 'Password reset link sent to your email.');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteAccount();
    setIsDeleting(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      setIsDeleteDialogOpen(false);
      router.push('/login');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal profile, security credentials, and preferences.
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="bg-card/70 border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={avatarUrl || user.avatar_url || ''} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{user.full_name || 'Anonymous Trader'}</CardTitle>
                <Badge variant={role === 'admin' ? 'default' : 'secondary'} className="uppercase text-[10px] px-2 py-0.5">
                  {role}
                </Badge>
              </div>
              <CardDescription className="text-sm mt-0.5">{user.email}</CardDescription>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                Member since {formatDate(user.created_at)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Display Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Avatar Image URL</label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={isUpdating} className="gap-1.5">
                <Save className="h-4 w-4" />
                {isUpdating ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security & Password Reset */}
      <Card className="bg-card/70 border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Security & Credentials</CardTitle>
          </div>
          <CardDescription>Update your login password or request a secure reset email.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Password Reset</p>
            <p className="text-xs text-muted-foreground">
              Send a password reset email link to <strong>{user.email}</strong>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handlePasswordReset}>
            Send Reset Link
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <CardTitle className="text-base font-semibold">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account and all associated portfolio data, transactions, and price alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-destructive">Delete Account</p>
            <p className="text-xs text-muted-foreground">
              This action is irreversible and immediately wipes all your records.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive font-bold">Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete your account (<strong>{user.email}</strong>)? All your portfolios, transactions, and alerts will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Yes, Delete Everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
