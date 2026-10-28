import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';
import {
  saveUserExchangeCredentials,
  deleteUserExchangeCredentials,
  getUserExchangeStatus,
} from '@/lib/trade/credential-store';
import { validateExchangeApiKeys } from '@/lib/trade/binance-testnet';
import { exchangeKeySchema } from '@/lib/validations';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = rateLimit(`trade_keys_${clientIp}`, 15, 60 * 1000);
  if (!limitCheck.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment.' },
      { status: 429 }
    );
  }

  // 1. Authenticate user server-side
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required to connect exchange keys.' },
      { status: 401 }
    );
  }

  try {
    const rawBody = await request.json();
    const validationResult = exchangeKeySchema.safeParse(rawBody);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || 'Invalid exchange key payload';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { apiKey, apiSecret, exchange } = validationResult.data;

    // 2. Validate with Binance Testnet — REJECT IF WITHDRAWAL PERMISSIONS EXIST
    const exchangeCheck = await validateExchangeApiKeys(apiKey, apiSecret);
    if (!exchangeCheck.valid) {
      return NextResponse.json(
        { error: exchangeCheck.error || 'Exchange rejected the API key or secret.' },
        { status: 400 }
      );
    }

    // 3. Save encrypted credentials server-side associated with authenticated user.id
    const saved = await saveUserExchangeCredentials(user.id, apiKey, apiSecret, exchange);
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to securely encrypt and store credentials.' },
        { status: 500 }
      );
    }

    const maskedKey = apiKey.length >= 8
      ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
      : '****';

    return NextResponse.json({
      success: true,
      message: 'Exchange API key connected successfully (Trade-Only verified).',
      maskedKey,
      balances: exchangeCheck.balances || [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving exchange credentials.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ connected: false });
  }

  const status = await getUserExchangeStatus(user.id);
  return NextResponse.json(status);
}

export async function DELETE(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required to disconnect exchange.' },
      { status: 401 }
    );
  }

  await deleteUserExchangeCredentials(user.id);

  return NextResponse.json({
    success: true,
    message: 'Exchange connection severed and encrypted credentials permanently removed.',
  });
}
