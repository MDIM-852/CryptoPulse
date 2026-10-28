import crypto from 'crypto';

const BINANCE_TESTNET_BASE = 'https://testnet.binance.vision';

export interface BinanceTestnetOrderParams {
  apiKey: string;
  apiSecret: string;
  symbol: string; // e.g. BTCUSDT
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
}

export interface BinanceAccountInfo {
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  balances: {
    asset: string;
    free: string;
    locked: string;
  }[];
}

function createSignature(queryString: string, apiSecret: string): string {
  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
}

/**
 * Validates API key permissions.
 * STRICT RULE: If 'canWithdraw' is true or withdrawals are permitted,
 * reject the key immediately to prevent custody risk!
 */
export async function validateExchangeApiKeys(
  apiKey: string,
  apiSecret: string
): Promise<{ valid: boolean; error?: string; balances?: any[] }> {
  try {
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}&recvWindow=5000`;
    const signature = createSignature(query, apiSecret);

    const res = await fetch(`${BINANCE_TESTNET_BASE}/api/v3/account?${query}&signature=${signature}`, {
      method: 'GET',
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        valid: false,
        error: errJson.msg || `Exchange returned HTTP status ${res.status}. Check your API Key & Secret.`,
      };
    }

    const data: BinanceAccountInfo = await res.json();

    // SAFETY CHECK: Reject keys with withdrawal capabilities
    if (data.canWithdraw) {
      return {
        valid: false,
        error: 'Security Alert: This API key has Withdrawal permissions enabled. For your security, CryptoPulse only accepts Trade-Only keys without withdrawal permissions.',
      };
    }

    if (!data.canTrade) {
      return {
        valid: false,
        error: 'This API key does not have Spot Trading enabled.',
      };
    }

    const activeBalances = data.balances
      .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      .map((b) => ({
        asset: b.asset,
        free: parseFloat(b.free),
        locked: parseFloat(b.locked),
      }));

    return {
      valid: true,
      balances: activeBalances,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Network error connecting to Binance Testnet: ${err?.message || 'Unknown error'}`,
    };
  }
}

/**
 * Executes a trade on Binance Spot Testnet
 */
export async function placeBinanceTestnetOrder(
  params: BinanceTestnetOrderParams
): Promise<{ success: boolean; orderId?: string; executedQty?: number; price?: number; error?: string }> {
  try {
    const timestamp = Date.now();
    let queryObj: Record<string, string | number> = {
      symbol: params.symbol.toUpperCase(),
      side: params.side,
      type: params.type,
      quantity: params.quantity,
      timestamp,
      recvWindow: 5000,
    };

    if (params.type === 'LIMIT') {
      if (!params.price || params.price <= 0) {
        return { success: false, error: 'Limit price is required for LIMIT orders' };
      }
      queryObj.price = params.price;
      queryObj.timeInForce = 'GTC'; // Good 'Til Cancelled
    }

    const queryString = Object.entries(queryObj)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    const signature = createSignature(queryString, params.apiSecret);

    const res = await fetch(`${BINANCE_TESTNET_BASE}/api/v3/order?${queryString}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': params.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.msg || `Order rejected by exchange with status ${res.status}`,
      };
    }

    const avgPrice = parseFloat(data.cummulativeQuoteQty) / (parseFloat(data.executedQty) || 1);

    return {
      success: true,
      orderId: String(data.orderId),
      executedQty: parseFloat(data.executedQty),
      price: !isNaN(avgPrice) && avgPrice > 0 ? avgPrice : (params.price || 0),
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to execute order: ${err?.message || 'Connection error'}`,
    };
  }
}
