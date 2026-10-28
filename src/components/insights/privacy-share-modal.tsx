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
import { Share2, Copy, Check, ShieldCheck, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface PrivacyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioSlug: string;
}

export function PrivacyShareModal({
  isOpen,
  onClose,
  portfolioSlug,
}: PrivacyShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${portfolioSlug || 'demo-trader'}`
    : `/share/${portfolioSlug || 'demo-trader'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Privacy-safe link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Privacy-Safe Share Link</DialogTitle>
              <DialogDescription className="text-xs">
                Share your portfolio performance without revealing dollar amounts or balances.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Privacy Guarantee Box */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="h-4 w-4" />
              100% Zero-Knowledge Balance Protection
            </div>
            <p className="text-[11px] leading-relaxed">
              This public page displays <strong>percentage returns</strong>, <strong>asset allocation %</strong>, and <strong>Risk Pulse</strong> only. Your dollar amounts, trade sizes, and personal identity remain completely private.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Public Share URL</label>
            <div className="flex gap-2">
              <Input readOnly value={shareUrl} className="font-mono text-xs bg-muted/50" />
              <Button onClick={handleCopy} size="sm" className="gap-1.5 shrink-0">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
