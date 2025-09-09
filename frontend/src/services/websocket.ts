import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';

export interface WebSocketEvents {
  'balance-updated': (data: { userId: string; balance: number }) => void;
  'transaction-updated': (data: { userId: string; transaction: any }) => void;
  'notification': (data: { title: string; message: string; type: string; data?: any }) => void;
  'profile-updated': (data: { userId: string; profile: any }) => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor() {
    this.connect();
  }

  private connect() {
    this.socket = io(API_CONFIG.WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔌 WebSocket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔌 WebSocket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔌 WebSocket reconnection failed');
      this.isConnected = false;
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔌 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket && !this.isConnected) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('🔌 Max reconnection attempts reached');
    }
  }

  // Join user room for personalized updates
  joinUserRoom(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-user-room', userId);
      console.log(`🔌 Joined user room: ${userId}`);
    }
  }

  // Leave user room
  leaveUserRoom(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-user-room', userId);
      console.log(`🔌 Left user room: ${userId}`);
    }
  }

  // Listen for events
  on<K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) {
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  // Remove event listener
  off<K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Emit events (for admin functions)
  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  // Reconnect manually
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.connect();
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
