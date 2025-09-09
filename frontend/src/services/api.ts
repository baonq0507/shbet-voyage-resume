import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/api';

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string;
}

// API Error interface
export interface ApiError {
  success: false;
  error: string;
  details?: string;
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.log('🚨 401 Unauthorized error detected, clearing token and redirecting to home');
          console.log('Error details:', error.response?.data);
          this.clearToken();
          // Redirect to home page instead of /login since there's no /login route
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage on initialization
    this.loadToken();
  }

  // Token management
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  private loadToken() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.token = token;
    }
  }

  // Auth APIs
  async register(data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    phoneNumber?: string;
    referralCode?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async login(data: {
    username: string;
    password: string;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/auth/login', data);
    return response.data;
  }

  async checkUsername(username: string): Promise<ApiResponse> {
    const response = await this.api.post('/auth/check-username', { username });
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<ApiResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await this.api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.api.post('/auth/logout');
    this.clearToken();
    return response.data;
  }

  // User APIs
  async getProfile(): Promise<ApiResponse> {
    const response = await this.api.get('/users/profile');
    return response.data;
  }

  async updateProfile(data: {
    full_name?: string;
    username?: string;
    phone_number?: string;
    avatar_url?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.put('/users/profile', data);
    return response.data;
  }

  async uploadAvatar(base64: string, fileName: string): Promise<ApiResponse> {
    const response = await this.api.post('/users/upload-avatar', {
      image: base64,
      fileName: fileName
    });
    return response.data;
  }

  async changePassword(newPassword: string): Promise<ApiResponse> {
    const response = await this.api.put('/users/change-password', {
      newPassword: newPassword
    });
    return response.data;
  }

  async getBankAccounts(): Promise<ApiResponse> {
    const response = await this.api.get('/users/bank-accounts');
    return response.data;
  }

  async addBankAccount(data: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/users/bank-accounts', data);
    return response.data;
  }

  async updateBankAccount(id: string, data: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.put(`/users/bank-accounts/${id}`, data);
    return response.data;
  }

  async deleteBankAccount(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/users/bank-accounts/${id}`);
    return response.data;
  }

  // Game APIs
  async getGames(params?: {
    page?: number;
    limit?: number;
    category?: string;
    provider?: string;
    search?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/games/all', { params });
    return response.data;
  }

  async getGamesByCategory(category: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const response = await this.api.get(`/games/category/${category}`, { params });
    return response.data;
  }

  async getGameById(id: string): Promise<ApiResponse> {
    const response = await this.api.get(`/games/${id}`);
    return response.data;
  }

  async getGameCategories(): Promise<ApiResponse> {
    const response = await this.api.get('/games/categories');
    return response.data;
  }

  async getGameProviders(): Promise<ApiResponse> {
    const response = await this.api.get('/games/providers');
    return response.data;
  }

  async gameLogin(gameId: string): Promise<ApiResponse> {
    const response = await this.api.post(`/games/${gameId}/login`);
    return response.data;
  }

  async depositToGame(amount: number): Promise<ApiResponse> {
    const response = await this.api.post('/games/deposit', { amount });
    return response.data;
  }

  async withdrawFromGame(amount: number): Promise<ApiResponse> {
    const response = await this.api.post('/games/withdraw', { amount });
    return response.data;
  }

  // Transaction APIs
  async createDepositOrder(data: {
    amount: number;
    bankId: string;
    note?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/transactions/deposit', data);
    return response.data;
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/transactions', { params });
    return response.data;
  }

  async getTransactionById(id: string): Promise<ApiResponse> {
    const response = await this.api.get(`/transactions/${id}`);
    return response.data;
  }

  // Promotion APIs
  async getActivePromotions(): Promise<ApiResponse> {
    const response = await this.api.get('/promotions/active');
    return response.data;
  }

  async checkPromotionCode(code: string): Promise<ApiResponse> {
    const response = await this.api.post('/promotions/check-code', { code });
    return response.data;
  }

  async applyPromotionCode(code: string, amount: number): Promise<ApiResponse> {
    const response = await this.api.post('/promotions/apply-code', { code, amount });
    return response.data;
  }

  // Notification APIs
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    const response = await this.api.put(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    const response = await this.api.put('/notifications/read-all');
    return response.data;
  }

  async getUnreadCount(): Promise<ApiResponse> {
    const response = await this.api.get('/notifications/unread-count');
    return response.data;
  }

  // Admin APIs
  async getDashboardStats(): Promise<ApiResponse> {
    const response = await this.api.get('/admin/dashboard-stats');
    return response.data;
  }

  async getUserRole(): Promise<ApiResponse> {
    const response = await this.api.get('/users/role');
    return response.data;
  }

  // Agent APIs
  async getAgentInfo(): Promise<ApiResponse> {
    const response = await this.api.get('/agents/info');
    return response.data;
  }

  async getAgentReferrals(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/agents/referrals', { params });
    return response.data;
  }

  // Admin APIs
  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/admin/users', { params });
    return response.data;
  }

  async getAdminTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    userId?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/admin/transactions', { params });
    return response.data;
  }

  async updateTransactionStatus(id: string, data: {
    status: string;
    adminNote?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.put(`/admin/transactions/${id}/status`, data);
    return response.data;
  }

  async getAdminGames(params?: {
    page?: number;
    limit?: number;
    category?: string;
    provider?: string;
    search?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/admin/games', { params });
    return response.data;
  }

  async updateGameStatus(id: string, data: {
    isActive?: boolean;
    isEnabled?: boolean;
    isMaintain?: boolean;
  }): Promise<ApiResponse> {
    const response = await this.api.put(`/admin/games/${id}/status`, data);
    return response.data;
  }

  async getAdminBanks(): Promise<ApiResponse> {
    const response = await this.api.get('/admin/banks');
    return response.data;
  }

  async addBank(data: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrCodeUrl?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.post('/admin/banks', data);
    return response.data;
  }

  async updateBank(id: string, data: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    qrCodeUrl?: string;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    const response = await this.api.put(`/admin/banks/${id}`, data);
    return response.data;
  }

  async getAdminPromotions(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/admin/promotions', { params });
    return response.data;
  }

  async createPromotion(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/admin/promotions', data);
    return response.data;
  }

  async updatePromotion(id: string, data: any): Promise<ApiResponse> {
    const response = await this.api.put(`/admin/promotions/${id}`, data);
    return response.data;
  }

  async deletePromotion(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/admin/promotions/${id}`);
    return response.data;
  }

}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
