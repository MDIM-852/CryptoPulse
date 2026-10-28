import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server-auth';
import { getGlobalKillSwitch, setGlobalKillSwitch } from '@/lib/trade/killswitch-state';
import { killSwitchSchema } from '@/lib/validations';
import { rateLimit } from '@/lib/ratelimit';

export async function GET() {
  return NextResponse.json({
    killSwitchActive: getGlobalKillSwitch(),
  });
}

export async function POST(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = rateLimit(`killswitch_toggle_${clientIp}`, 10, 60 * 1000);
  if (!limitCheck.success) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }

  // 1. Enforce Administrator Role Server-Side
  const adminUser = await requireAdmin(request);
  if (!adminUser) {
    return NextResponse.json(
      { error: 'Forbidden: Administrator privileges required to toggle the global trading kill switch.' },
      { status: 403 }
    );
  }

  try {
    const rawBody = await request.json();
    const validationResult = killSwitchSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input. Boolean "active" field is required.' },
        { status: 400 }
      );
    }

    const { active } = validationResult.data;
    setGlobalKillSwitch(active);

    return NextResponse.json({
      success: true,
      killSwitchActive: active,
      message: `Global Trading Kill-Switch is now ${active ? 'ACTIVATED (Trading Halted)' : 'DEACTIVATED (Trading Normal)'}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to update global kill switch state.' },
      { status: 500 }
    );
  }
}
