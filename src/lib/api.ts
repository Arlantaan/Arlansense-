/**
 * API client for connecting frontend to Python backend
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  tagline?: string;
  fragrance_pyramid?: {
    top_notes: string[];
    middle_notes?: string[];
    base_notes?: string[];
  };
  in_stock: boolean;
  quantity?: number;
  category?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: Address;
  payment_method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash_on_delivery';
  created_at: string;
  updated_at: string;
  tracking_number?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
  subject?: string;
}

export interface OrderCreate {
  items: CartItem[];
  shipping_address: Address;
  payment_method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash_on_delivery';
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

// API Functions
export const api = {
  // Health check
  health: async (): Promise<APIResponse> => {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products');
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Orders
  createOrder: async (orderData: OrderCreate): Promise<APIResponse> => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // Contact
  submitContact: async (contactData: ContactForm): Promise<APIResponse> => {
    const response = await apiClient.post('/contact', contactData);
    return response.data;
  },

  // Admin (requires authentication)
  getAdminOrders: async (token: string): Promise<Order[]> => {
    const response = await apiClient.get('/admin/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getAdminStats: async (token: string): Promise<any> => {
    const response = await apiClient.get('/admin/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export default api;
