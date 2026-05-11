/// <reference types="vite/client" />

/**
 * API Service for Motowash System
 * Migrated from Supabase to custom Node.js/MySQL backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const API_ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';

interface RequestOptions extends RequestInit {
  token?: string;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...customOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...customOptions.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...customOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authService = {
  login: (credentials: any) => apiRequest<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (data: any) => apiRequest<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: (token: string) => apiRequest<any>('/auth/me', {
    method: 'GET',
    token,
  }),
};

export const serviceService = {
  getServices: () => apiRequest<any[]>('/services'),
};

export const bookingService = {
  createBooking: (data: any, token: string) => apiRequest<any>('/transactions', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  }),
  getUserBookings: (token: string) => apiRequest<any[]>('/transactions/user', {
    method: 'GET',
    token,
  }),
  getAllBookings: (token: string) => apiRequest<any[]>('/transactions/all', {
    method: 'GET',
    token,
  }),
  updateBookingStatus: (id: string, status: string, token: string) => apiRequest<any>(`/transactions/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  }),
};

export const voucherService = {
  getActiveVouchers: () => apiRequest<any[]>('/vouchers/active'),
  createVoucher: (data: any, token: string) => apiRequest<any>('/vouchers', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  }),
};

export const userService = {
  updateProfile: (data: any, token: string) => apiRequest<any>('/users/profile', {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  }),
  getAllUsers: (token: string) => apiRequest<any[]>('/users/all', {
    method: 'GET',
    token,
  }),
};

export const chatService = {
  getConversations: (token: string) => apiRequest<any[]>('/messages/conversations/list', {
    method: 'GET',
    token,
  }),
  getUnreadCount: (token: string) => apiRequest<any>('/messages/unread/count', {
    method: 'GET',
    token,
  }),
  getMessages: (receiverId: string, token: string) => apiRequest<any>(`/messages/${receiverId}`, {
    method: 'GET',
    token,
  }),
  sendMessage: (data: any, token: string) => apiRequest<any>('/messages', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  }),
};

export const notificationService = {
  getNotifications: (token: string) => apiRequest<any[]>('/notifications', {
    method: 'GET',
    token,
  }),
  markAsRead: (id: string, token: string) => apiRequest<any>(`/notifications/${id}/read`, {
    method: 'PATCH',
    token,
  }),
  markAllAsRead: (token: string) => apiRequest<any>('/notifications/read-all', {
    method: 'PATCH',
    token,
  }),
};
