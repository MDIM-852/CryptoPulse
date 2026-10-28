import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const transactionSchema = z.object({
  coin_id: z.string().min(1, { message: "Coin is required." }),
  coin_symbol: z.string().min(1, { message: "Symbol is required." }),
  coin_name: z.string().min(1, { message: "Name is required." }),
  type: z.enum(["BUY", "SELL"], {
    errorMap: () => ({ message: "Transaction type must be BUY or SELL." }),
  }),
  amount: z.coerce.number().positive({ message: "Amount must be greater than 0." }),
  price_per_unit: z.coerce.number().min(0, { message: "Price must be non-negative." }),
  transaction_date: z.string().min(1, { message: "Transaction date is required." }),
  notes: z.string().max(300, { message: "Notes cannot exceed 300 characters." }).optional(),
});

export const priceAlertSchema = z.object({
  coin_id: z.string().min(1, { message: "Coin is required." }),
  coin_symbol: z.string().min(1, { message: "Symbol is required." }),
  coin_name: z.string().min(1, { message: "Name is required." }),
  target_price: z.coerce.number().positive({ message: "Target price must be greater than 0." }),
  condition: z.enum(["ABOVE", "BELOW"], {
    errorMap: () => ({ message: "Condition must be ABOVE or BELOW." }),
  }),
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(60),
  avatar_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
});

// Exchange Connection Key Schema
export const exchangeKeySchema = z.object({
  apiKey: z.string().min(8, { message: "API Key must be at least 8 characters." }).max(128),
  apiSecret: z.string().min(8, { message: "API Secret must be at least 8 characters." }).max(128),
  exchange: z.enum(["binance_testnet", "binance", "coinbase"]).default("binance_testnet"),
});

// Trade Execution Schema
export const tradeOrderSchema = z.object({
  mode: z.enum(["paper", "real_exchange"]),
  symbol: z
    .string()
    .min(2, { message: "Symbol must be at least 2 characters." })
    .max(20)
    .regex(/^[A-Z0-9]+$/, { message: "Symbol must contain uppercase letters and numbers only." }),
  side: z.enum(["BUY", "SELL"], {
    errorMap: () => ({ message: "Side must be BUY or SELL." }),
  }),
  type: z.enum(["MARKET", "LIMIT"], {
    errorMap: () => ({ message: "Type must be MARKET or LIMIT." }),
  }),
  quantity: z.coerce.number().positive({ message: "Quantity must be greater than 0." }),
  price: z.coerce.number().positive({ message: "Price must be greater than 0." }).optional(),
}).refine(
  (data) => data.type !== "LIMIT" || (data.price !== undefined && data.price > 0),
  {
    message: "Limit price is required and must be greater than 0 for LIMIT orders.",
    path: ["price"],
  }
);

// Global Trading Kill Switch Schema
export const killSwitchSchema = z.object({
  active: z.boolean({ required_error: "Active boolean status is required." }),
});
