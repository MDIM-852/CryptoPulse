'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, ShieldCheck, TrendingUp, Bell } from 'lucide-react';
import { formatPercentage } from '@/lib/formatters';

interface RegretGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinName: string;
  coinSymbol: string;
  change24h: number;
  onProceed: () => void;
  onSetAlertInstead?: () => void;
}

export function RegretGuardModal({
  isOpen,
  onClose,
  coinName,
  coinSymbol,
  change24h,
  onProceed,
  onSetAlertInstead,
}: RegretGuardModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 minutes (600s)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [allowOverride, setAllowOverride] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerActive && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, secondsRemaining]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const startCoolingOff = () => {
    setIsTimerActive(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-amber-500/40">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                Regret Guard: FOMO Check
              </DialogTitle>
              <DialogDescription className="text-xs">
                Behavioral psychology check before executing high-volatility buys.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Surge Alert Card */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-foreground">
                {coinName} ({coinSymbol}) is surging
              </span>
              <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {formatPercentage(change24h)} (24h)
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Buying assets after aggressive double-digit pumps carries higher statistical risk of buying the local top and suffering immediate retracements.
            </p>
          </div>

          {/* 10-Minute Cooling-off Section */}
          {isTimerActive ? (
            <div className="p-4 rounded-xl border bg-card text-center space-y-2">
              <Clock className="h-6 w-6 text-primary mx-auto animate-pulse" />
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Cooling-off Timer Active
              </p>
              <h3 className="text-3xl font-bold font-mono text-primary">{timeFormatted}</h3>
              <p className="text-[11px] text-muted-foreground">
                Take a breath. Markets will still be here in 10 minutes.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center gap-2 border-primary/40 hover:bg-primary/5 text-primary"
                onClick={startCoolingOff}
              >
                <Clock className="h-4 w-4" />
                Take 10-Minute Cooling-Off Period
              </Button>

              {onSetAlertInstead && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-center gap-2 text-xs text-muted-foreground"
                  onClick={() => {
                    onClose();
                    onSetAlertInstead();
                  }}
                >
                  <Bell className="h-3.5 w-3.5" />
                  Set a dip price alert instead
                </Button>
              )}
            </div>
          )}

          {/* Override Checkbox */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <input
              type="checkbox"
              id="overrideFomo"
              checked={allowOverride}
              onChange={(e) => setAllowOverride(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="overrideFomo" className="text-xs text-muted-foreground cursor-pointer select-none">
              I have a clear thesis and accept the risk of buying into a pump.
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel Order
          </Button>
          <Button
            disabled={!allowOverride}
            onClick={() => {
              onClose();
              onProceed();
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <ShieldCheck className="h-4 w-4 mr-1.5" />
            Proceed with Buy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
