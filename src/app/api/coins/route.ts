import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/ratelimit';
import { CoinMarketData } from '@/types';

// Fallback static data in case CoinGecko free tier hits its rate limit (30 req/min)
const FALLBACK_TOP_COINS: Partial<CoinMarketData>[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 63850, market_cap: 1260000000000, market_cap_rank: 1, total_volume: 28400000000, high_24h: 64200, low_24h: 62900, price_change_24h: 950, price_change_percentage_24h: 1.51, image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 2640, market_cap: 317000000000, market_cap_rank: 2, total_volume: 14200000000, high_24h: 2680, low_24h: 2590, price_change_24h: 50, price_change_percentage_24h: 1.93, image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'tether', symbol: 'usdt', name: 'Tether', current_price: 1.0, market_cap: 119000000000, market_cap_rank: 3, total_volume: 45000000000, high_24h: 1.002, low_24h: 0.998, price_change_24h: 0, price_change_percentage_24h: 0.01, image: 'https://coin-images.coingecko.com/coins/images/325/large/Tether.png' },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', current_price: 585, market_cap: 85000000000, market_cap_rank: 4, total_volume: 1100000000, high_24h: 592, low_24h: 578, price_change_24h: 7, price_change_percentage_24h: 1.21, image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
  { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 154.5, market_cap: 72000000000, market_cap_rank: 5, total_volume: 3200000000, high_24h: 158, low_24h: 149, price_change_24h: 5.5, price_change_percentage_24h: 3.69, image: 'https://coin-images.coingecko.com/coins/images/4128/large/solana.png' },
  { id: 'usd-coin', symbol: 'usdc', name: 'USDC', current_price: 1.0, market_cap: 35000000000, market_cap_rank: 6, total_volume: 5200000000, high_24h: 1.001, low_24h: 0.999, price_change_24h: 0, price_change_percentage_24h: 0.0, image: 'https://coin-images.coingecko.com/coins/images/6319/large/usdc.png' },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.585, market_cap: 33000000000, market_cap_rank: 7, total_volume: 1200000000, high_24h: 0.605, low_24h: 0.575, price_change_24h: 0.01, price_change_percentage_24h: 1.74, image: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', current_price: 0.122, market_cap: 17800000000, market_cap_rank: 8, total_volume: 980000000, high_24h: 0.128, low_24h: 0.118, price_change_24h: 0.004, price_change_percentage_24h: 3.39, image: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png' },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.385, market_cap: 13800000000, market_cap_rank: 9, total_volume: 340000000, high_24h: 0.395, low_24h: 0.378, price_change_24h: 0.007, price_change_percentage_24h: 1.85, image: 'https://coin-images.coingecko.com/coins/images/975/large/cardano.png' },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', current_price: 28.4, market_cap: 11400000000, market_cap_rank: 10, total_volume: 410000000, high_24h: 29.2, low_24h: 27.5, price_change_24h: 0.9, price_change_percentage_24h: 3.27, image: 'https://coin-images.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png' },
];

let memoryCache: { data: CoinMarketData[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds server cache

export async function GET(request: Request) {
  // 1. Apply rate limiter (60 requests per minute per IP)
  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const limitCheck = rateLimit(`coins_api_${clientIp}`, 60, 60 * 1000);

  if (!limitCheck.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(limitCheck.reset),
          'X-RateLimit-Limit': String(limitCheck.limit),
          'X-RateLimit-Remaining': String(limitCheck.remaining),
        },
      }
    );
  }

  // 2. Check Memory Cache
  const now = Date.now();
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(memoryCache.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'HIT',
      },
    });
  }

  // 3. Fetch from CoinGecko Free API
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (apiKey) {
      headers['x-cg-demo-api-key'] = apiKey;
    }

    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=1h,24h,7d',
      {
        headers,
        next: { revalidate: 30 },
      }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko API returned status ${res.status}`);
    }

    const data: CoinMarketData[] = await res.json();
    memoryCache = { data, timestamp: now };

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (err: any) {
    console.warn('CoinGecko fetch failed, using fallback market data:', err?.message);

    // If cache exists even if stale, return it
    if (memoryCache) {
      return NextResponse.json(memoryCache.data, {
        headers: { 'X-Cache': 'STALE_FALLBACK' },
      });
    }

    // Return complete mock list
    return NextResponse.json(FALLBACK_TOP_COINS, {
      headers: { 'X-Cache': 'STATIC_FALLBACK' },
    });
  }
}
