import { createClient } from "npm:@supabase/supabase-js@2";
import { projectId, publicAnonKey } from "./info.tsx";

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type User = {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar_url?: string;
  location?: string;
  created_at: string;
  updated_at: string;
  last_seen: string;
  is_online: boolean;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "booking" | "promo" | "chat" | "general";
  read: boolean;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  valid_from: string;
  valid_until: string;
  max_usage: number;
  current_usage: number;
  active: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  bike_size: string;
  service: string;
  date: string;
  time: string;
  status: string;
  voucher_code?: string;
  created_at: string;
  updated_at: string;
};
