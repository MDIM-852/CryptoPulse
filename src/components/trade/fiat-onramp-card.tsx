'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ExternalLink, ShieldCheck, Zap, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export function FiatOnRampCard() {
  const [amount, setAmount] = useState('250');
  const [cryptoAsset, setCryptoAsset] = useState('USDT');
  const [provider, setProvider] = useState<'transak' | 'moonpay'>('transak');
  const [walletAddress, setWalletAddress] = useState('');

  const numAmount = parseFloat(amount) || 0;
  const estimatedCrypto = (numAmount * 0.985).toFixed(2); // ~1.5% fee estimate

  const getSandboxUrl = () => {
    if (provider === 'transak') {
      return `https://global-stg.transak.com/?apiKey=sandbox&cryptoCurrencyList=USDT,BTC,ETH,SOL&defaultCryptoCurrency=${cryptoAsset}&fiatAmount=${amount}&fiatCurrency=USD&redirectURL=${typeof window !== 'undefined' ? window.location.origin : ''}`;
    }
    return `https://buy-staging.moonpay.com?apiKey=pk_test_123&defaultCurrencyCode=${cryptoAsset.toLowerCase()}&baseCurrencyAmount=${amount}&baseCurrencyCode=usd`;
  };

  return (
    <Card className="bg-card/70 border-border/80 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Fiat On-Ramp (Instant Buy)</CardTitle>
              <CardDescription className="text-xs">
                Buy cryptocurrency with Card, Apple Pay, or Bank Wire. KYC & payments processed directly by regulated providers.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-mono">
            Sandbox Environment
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Provider Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setProvider('transak')}
            className={`p-3 rounded-xl border text-left transition-all ${
              provider === 'transak'
                ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                : 'bg-muted/30 border-border hover:bg-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">Transak</span>
              <Badge variant="secondary" className="text-[9px] px-1 py-0">Global / SEPA</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Apple Pay, Visa/MC, Instant SEPA
            </p>
          </button>

          <button
            type="button"
            onClick={() => setProvider('moonpay')}
            className={`p-3 rounded-xl border text-left transition-all ${
              provider === 'moonpay'
                ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                : 'bg-muted/30 border-border hover:bg-muted'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">MoonPay</span>
              <Badge variant="secondary" className="text-[9px] px-1 py-0">160+ Countries</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Google Pay, Debit Card, Wire
            </p>
          </button>
        </div>

        {/* Amount & Asset Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">You Pay (USD)</label>
            <Input
              type="number"
              min="20"
              max="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="250"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">You Receive (~Estimated)</label>
            <div className="flex items-center gap-2">
              <div className="h-10 px-3 rounded-lg border bg-muted/50 flex items-center font-mono font-bold text-sm flex-1">
                ≈ {estimatedCrypto} {cryptoAsset}
              </div>
              <select
                value={cryptoAsset}
                onChange={(e) => setCryptoAsset(e.target.value)}
                className="h-10 px-3 rounded-lg border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="SOL">SOL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Destination Wallet Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Destination Self-Custody Wallet (Optional)</label>
          <Input
            type="text"
            placeholder="0x... or sol... (Your personal hardware or software address)"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>

        {/* Launch Widget Button */}
        <Button
          asChild
          className="w-full gap-2 font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <a href={getSandboxUrl()} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Continue to {provider === 'transak' ? 'Transak' : 'MoonPay'} Checkout
          </a>
        </Button>

        {/* Non-Custodial Safety Disclaimer */}
        <div className="p-3 rounded-xl bg-muted/40 border text-[11px] text-muted-foreground flex items-center gap-2">
          <Lock className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span>
            Non-Custodial: Funds are settled directly to your wallet by the payment processor. CryptoPulse never handles or stores your payment details.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
