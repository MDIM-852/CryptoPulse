'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrade } from '@/context/trade-context';
import { ShieldCheck, Lock, ExternalLink, AlertTriangle, Key } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectExchangeModal({ isOpen, onClose }: ConnectExchangeModalProps) {
  const { connectExchangeKeys } = useTrade();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !apiSecret) {
      toast.error('Both API Key and Secret Key are required.');
      return;
    }

    setIsLoading(true);
    const res = await connectExchangeKeys(apiKey, apiSecret);
    setIsLoading(false);

    if (res.success) {
      onClose();
    } else {
      toast.error(res.error || 'Failed to connect keys.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Connect Trade-Only API</DialogTitle>
              <DialogDescription className="text-xs">
                Zero-risk real spot execution on Binance Spot Testnet.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Guide Banner */}
          <div className="p-3.5 rounded-xl bg-muted/60 border space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>Need Free Testnet Keys?</span>
              <a
                href="https://testnet.binance.vision"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline flex items-center gap-1 font-mono"
              >
                testnet.binance.vision <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-[11px] leading-relaxed">
              Login to Binance Testnet with GitHub, generate an HMAC-SHA256 API Key & Secret with Spot Trading enabled.
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4" />
              Non-Custodial & Server-Side Encrypted
            </div>
            <p className="text-[11px] leading-relaxed">
              Keys are encrypted with AES-256-GCM. Any API key with withdrawal permissions enabled is automatically rejected.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">API Key (Public)</label>
            <Input
              type="text"
              placeholder="e.g. vmPUZE6mv9SD5VNHk4HlWFsOr6a..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">API Secret (Private)</label>
            <Input
              type="password"
              placeholder="e.g. 1wz3lQx78s..."
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Verifying & Encrypting...' : 'Connect & Verify Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
