import { encryptSecret, decryptSecret } from '@/lib/encryption';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface StoredCredentialRecord {
  apiKey: string;
  encryptedSecret: string;
  exchangeName: string;
  updatedAt: number;
}

// Server-side encrypted credential store (memory backup & demo persistence)
const memoryKeyStore = new Map<string, StoredCredentialRecord>();

export async function saveUserExchangeCredentials(
  userId: string,
  apiKey: string,
  plainApiSecret: string,
  exchangeName: string = 'binance_testnet'
): Promise<boolean> {
  const encryptedSecret = encryptSecret(plainApiSecret);
  if (!encryptedSecret) return false;

  // 1. Save in server memory store
  memoryKeyStore.set(userId, {
    apiKey,
    encryptedSecret,
    exchangeName,
    updatedAt: Date.now(),
  });

  // 2. Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabase();
      if (supabase) {
        await supabase.from('user_exchange_keys').upsert({
          user_id: userId,
          exchange_name: exchangeName,
          api_key: apiKey,
          encrypted_api_secret: encryptedSecret,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,exchange_name' });
      }
    } catch (err) {
      console.warn('Could not persist encrypted keys to Supabase (using secure server memory):', err);
    }
  }

  return true;
}

export async function getUserExchangeCredentials(
  userId: string
): Promise<{ apiKey: string; apiSecret: string; exchangeName: string } | null> {
  let encryptedSecret = '';
  let apiKey = '';
  let exchangeName = 'binance_testnet';

  // 1. Check Supabase first if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabase();
      if (supabase) {
        const { data, error } = await supabase
          .from('user_exchange_keys')
          .select('api_key, encrypted_api_secret, exchange_name')
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          apiKey = data.api_key;
          encryptedSecret = data.encrypted_api_secret;
          exchangeName = data.exchange_name || 'binance_testnet';
        }
      }
    } catch (err) {
      console.warn('Error fetching keys from Supabase:', err);
    }
  }

  // 2. Check memory store if not found in Supabase
  if (!apiKey || !encryptedSecret) {
    const memoryRecord = memoryKeyStore.get(userId);
    if (memoryRecord) {
      apiKey = memoryRecord.apiKey;
      encryptedSecret = memoryRecord.encryptedSecret;
      exchangeName = memoryRecord.exchangeName;
    }
  }

  if (!apiKey || !encryptedSecret) {
    return null;
  }

  // 3. Decrypt secret server-side
  const apiSecret = decryptSecret(encryptedSecret);
  if (!apiSecret) {
    return null;
  }

  return {
    apiKey,
    apiSecret,
    exchangeName,
  };
}

export async function deleteUserExchangeCredentials(userId: string): Promise<boolean> {
  memoryKeyStore.delete(userId);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabase();
      if (supabase) {
        await supabase.from('user_exchange_keys').delete().eq('user_id', userId);
      }
    } catch (err) {
      console.warn('Error deleting keys from Supabase:', err);
    }
  }

  return true;
}

export async function getUserExchangeStatus(
  userId: string
): Promise<{ connected: boolean; exchange?: string; maskedKey?: string }> {
  let apiKey = '';
  let exchange = 'binance_testnet';

  if (isSupabaseConfigured()) {
    try {
      const supabase = createServerSupabase();
      if (supabase) {
        const { data } = await supabase
          .from('user_exchange_keys')
          .select('api_key, exchange_name')
          .eq('user_id', userId)
          .single();

        if (data) {
          apiKey = data.api_key;
          exchange = data.exchange_name || 'binance_testnet';
        }
      }
    } catch {}
  }

  if (!apiKey) {
    const memoryRecord = memoryKeyStore.get(userId);
    if (memoryRecord) {
      apiKey = memoryRecord.apiKey;
      exchange = memoryRecord.exchangeName;
    }
  }

  if (!apiKey) {
    return { connected: false };
  }

  const maskedKey = apiKey.length >= 8
    ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
    : '****';

  return {
    connected: true,
    exchange,
    maskedKey,
  };
}
