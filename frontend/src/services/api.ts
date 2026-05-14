/// <reference types="vite/client" />

/**
 * API Service for Motowash System
 * Migrated from Supabase to custom Node.js/MySQL backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
export const API_ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5005';

// Base URL of the backend server (for constructing static file URLs like avatars)
export const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5005/api').replace('/api', '');

/**
 * Converts a stored avatar_url (which may be a relative /uploads/... path)
 * to a full URL that the browser can load.
 */
export function getAvatarUrl(avatarUrl?: string | null): string | undefined {
  if (!avatarUrl || avatarUrl.startsWith('blob:')) return undefined;
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) return avatarUrl;
  if (avatarUrl.startsWith('/uploads/')) return `${BACKEND_URL}${avatarUrl}`;
  return avatarUrl;
}

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

  let data;
  try {
    data = await response.json();
  } catch (err) {
    throw new Error(`Invalid response from ${endpoint}`);
  }

  if (!response.ok) {
    throw new Error(data.message || `Error: ${response.status} ${response.statusText}`);
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
  getActiveVouchers: () => apiRequest<any>('/vouchers/active'),
  validateVoucher: (code: string, amount: number, token: string) => apiRequest<any>('/vouchers/validate', {
    method: 'POST',
    token,
    body: JSON.stringify({ code, amount }),
  }),
  getAdminVouchers: (token: string) => apiRequest<any>('/vouchers/admin', {
    method: 'GET',
    token,
  }),
  createVoucher: (data: any, token: string) => apiRequest<any>('/vouchers/admin', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  }),
  updateVoucher: (id: number, data: any, token: string) => apiRequest<any>(`/vouchers/admin/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  }),
  deactivateVoucher: (id: number, token: string) => apiRequest<any>(`/vouchers/admin/${id}`, {
    method: 'DELETE',
    token,
  }),
};

export const userService = {
  updateProfile: (data: any, token: string) => apiRequest<any>('/users/profile', {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  }),
  uploadAvatar: async (file: File, token: string): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Gagal upload avatar');
    return data;
  },
  getAllUsers: (token: string) => apiRequest<any[]>('/users/all', {
    method: 'GET',
    token,
  }),
  updateAIConfig: (ai_enabled: boolean, token: string) => apiRequest<any>('/users/ai-config', {
    method: 'PUT',
    token,
    body: JSON.stringify({ ai_enabled }),
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

export const galleryService = {
  getGallery: () => apiRequest<any[]>('/gallery'),
  addGallery: (data: { url: string; title: string }, token: string) => apiRequest<any>('/gallery', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  }),
  updateGallery: (id: number, data: { url: string; title: string }, token: string) => apiRequest<any>(`/gallery/${id}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(data),
  }),
  deleteGallery: (id: number, token: string) => apiRequest<any>(`/gallery/${id}`, {
    method: 'DELETE',
    token,
  }),
};

export const bookingCardService = {
  getUserCards: (token: string) => apiRequest<any>('/booking-cards', {
    method: 'GET',
    token,
  }),
  getCardDetail: (code: string, token: string) => apiRequest<any>(`/booking-cards/${code}`, {
    method: 'GET',
    token,
  }),
  validateCard: (code: string, token: string) => apiRequest<any>('/booking-cards/validate', {
    method: 'POST',
    token,
    body: JSON.stringify({ code }),
  }),
};

export const pointsService = {
  getUserPoints: (token: string) => apiRequest<any>('/points', {
    method: 'GET',
    token,
  }),
};

export const reviewService = {
  getReviews: () => apiRequest<any[]>('/reviews'),
  createReview: (data: any, token: string) => apiRequest<any>('/reviews', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  }),
};
