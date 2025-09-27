// src/services/webSocketService.ts

import { Notification, WebSocketMessage } from '@/types/notification.types';
import { WS_EVENTS, NOTIFICATION_SETTINGS } from '@/constants/notificationConstants';

export type NotificationCallback = (notification: Notification) => void;
export type ConnectionStatusCallback = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private pingTimer: number | null = null;
  private isManualClose = false;
  
  // Callbacks
  private notificationCallbacks: Set<NotificationCallback> = new Set();
  private statusCallbacks: Set<ConnectionStatusCallback> = new Set();
  
  // Configuration
  private readonly maxReconnectAttempts = NOTIFICATION_SETTINGS.WS_MAX_RECONNECT_ATTEMPTS;
  private readonly reconnectInterval = NOTIFICATION_SETTINGS.WS_RECONNECT_INTERVAL;
  private readonly pingInterval = 30000; // 30 seconds

  /**
   * Connect to WebSocket server
   */
  connect(userId: number): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      console.log('WebSocket connection in progress');
      return;
    }

    this.isManualClose = false;
    this.notifyStatusCallbacks('connecting');
    
    try {
      const token = localStorage.getItem('token');
      const wsUrl = this.buildWebSocketUrl(userId, token);
      
      console.log('Connecting to WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);
      
      this.setupEventHandlers(userId);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.notifyStatusCallbacks('error');
      this.scheduleReconnect(userId);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('Manually disconnecting WebSocket');
    this.isManualClose = true;
    
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.notifyStatusCallbacks('disconnected');
    this.notificationCallbacks.clear();
    this.statusCallbacks.clear();
  }

  /**
   * Subscribe to new notifications
   */
  subscribeToNotifications(callback: NotificationCallback): () => void {
    this.notificationCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  subscribeToConnectionStatus(callback: ConnectionStatusCallback): () => void {
    this.statusCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'disconnecting';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  /**
   * Send a message through WebSocket
   */
  sendMessage(type: string, data?: any): void {
    if (!this.isConnected()) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    const message: WebSocketMessage = {
      type: type as any,
      data,
      timestamp: new Date().toISOString()
    };

    try {
      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  /**
   * Send ping to keep connection alive
   */
  private sendPing(): void {
    this.sendMessage(WS_EVENTS.PING);
  }

  /**
   * Build WebSocket URL with authentication
   */
  private buildWebSocketUrl(userId: number, token: string | null): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_HOST || window.location.host;
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${host}`;
    
    const params = new URLSearchParams();
    if (token) params.append('token', token);
    params.append('userId', userId.toString());
    
    return `${wsUrl}/notifications?${params.toString()}`;
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(userId: number): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully');
      this.reconnectAttempts = 0;
      this.notifyStatusCallbacks('connected');
      this.startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      this.clearTimers();
      this.notifyStatusCallbacks('disconnected');
      
      if (!this.isManualClose) {
        this.scheduleReconnect(userId);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.notifyStatusCallbacks('error');
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'NOTIFICATION':
        if (message.data) {
          this.notifyNotificationCallbacks(message.data);
        }
        break;
        
      case 'PING':
        // Respond to server ping with pong
        this.sendMessage(WS_EVENTS.PONG);
        break;
        
      case 'PONG':
        // Server acknowledged our ping
        console.debug('Received pong from server');
        break;
        
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }

  /**
   * Notify all notification callbacks
   */
  private notifyNotificationCallbacks(notification: Notification): void {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  /**
   * Notify all status callbacks
   */
  private notifyStatusCallbacks(status: 'connecting' | 'connected' | 'disconnected' | 'error'): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(userId: number): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.notifyStatusCallbacks('error');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isManualClose) {
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect(userId);
      }
    }, delay);
  }

  /**
   * Start ping timer to keep connection alive
   */
  private startPing(): void {
    this.clearPingTimer();
    
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendPing();
      }
    }, this.pingInterval);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.clearReconnectTimer();
    this.clearPingTimer();
  }

  /**
   * Clear reconnect timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Clear ping timer
   */
  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    isConnected: boolean;
    reconnectAttempts: number;
    connectionState: string;
    lastPingTime?: Date;
  } {
    return {
      isConnected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      connectionState: this.getConnectionState()
    };
  }

  /**
   * Force reconnection (useful for debugging)
   */
  forceReconnect(userId: number): void {
    console.log('Forcing WebSocket reconnection');
    this.isManualClose = false;
    this.reconnectAttempts = 0;
    
    if (this.ws) {
      this.ws.close();
    }
    
    setTimeout(() => {
      this.connect(userId);
    }, 1000);
  }
}

// Export singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;