import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/server-auth';
import { getUserExchangeCredentials } from '@/lib/trade/credential-store';
import { placeBinanceTestnetOrder } from '@/lib/trade/binance-testnet';
import { tradeOrderSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/ratelimit';
import { getGlobalKillSwitch } from '@/lib/trade/killswitch-state';

export async function POST(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = rateLimit(`trade_exec_${clientIp}`, 30, 60 * 1000);
  if (!limitCheck.success) {
    return NextResponse.json(
      { error: 'Trade rate limit exceeded. Please wait a few seconds before placing another order.' },
      { status: 429 }
    );
  }

  // 1. Check Global Admin Kill-Switch
  if (getGlobalKillSwitch()) {
    return NextResponse.json(
      { error: 'Trading is temporarily halted by system administrators (Global Kill-Switch Active).' },
      { status: 503 }
    );
  }

  // 2. Authenticate User Server-Side
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required to execute trades.' },
      { status: 401 }
    );
  }

  if (user.isDisabled) {
    return NextResponse.json(
      { error: 'Your account has been disabled. Trading is restricted.' },
      { status: 403 }
    );
  }

  try {
    const rawBody = await request.json();
    const validationResult = tradeOrderSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || 'Invalid trade order parameters';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { mode, symbol, side, type, quantity, price } = validationResult.data;

    // A. Paper Trading Mode Execution
    if (mode === 'paper') {
      const executedPrice = price || 1;
      const estimatedFee = (quantity * executedPrice) * 0.001; // 0.1% spot fee
      return NextResponse.json({
        success: true,
        orderId: `paper-ord-${Date.now()}`,
        mode: 'paper',
        executedQty: quantity,
        price: executedPrice,
        fee: estimatedFee,
        status: 'FILLED',
        executedAt: new Date().toISOString(),
      });
    }

    // B. Real Exchange Mode Execution (Binance Spot Testnet)
    // Obtain the user's stored exchange credentials server-side
    const credentials = await getUserExchangeCredentials(user.id);
    if (!credentials || !credentials.apiKey || !credentials.apiSecret) {
      return NextResponse.json(
        { error: 'No connected Binance Testnet credentials found for your account. Please connect your API keys in Settings.' },
        { status: 400 }
      );
    }

    const result = await placeBinanceTestnetOrder({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      symbol: symbol.toUpperCase(),
      side,
      type,
      quantity,
      price,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Exchange rejected the order.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      mode: 'real_exchange',
      executedQty: result.executedQty,
      price: result.price,
      status: 'FILLED',
      executedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred while executing the trade.' },
      { status: 500 }
    );
  }
}
