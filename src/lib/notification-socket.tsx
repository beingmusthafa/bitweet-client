import { store } from "../store";
import {
  setUnreadNotifications,
  addNewNotification,
} from "../store/slices/notificationSlice";
import NotificationToast from "../components/notifications/NotificationToast";
import { toast } from "sonner";

interface NotificationMessage {
  type: "unread_notifications" | "new_notification";
  data: any;
}

class NotificationWebSocket {
  private ws: WebSocket | null = null;
  private reconnectInterval: number = 5000;
  private reconnectTimer: NodeJS.Timeout | null = null;

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const message: NotificationMessage = JSON.parse(event.data);
          console.log("got a realtime message, passing");
          this.handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      this.scheduleReconnect();
    }
  }

  private handleMessage(message: NotificationMessage) {
    const { type, data } = message;

    switch (type) {
      case "unread_notifications":
        store.dispatch(setUnreadNotifications(data));
        break;

      case "new_notification":
        store.dispatch(addNewNotification(data));
        console.log("Got realtime notification :", data.message);
        this.showNotificationToast(data);
        break;
    }
  }

  private showNotificationToast(notification: any) {
    toast.custom((t) => {
      return <NotificationToast t={t} notification={notification} />;
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      console.log("Attempting to reconnect WebSocket...");
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const notificationWebSocket = new NotificationWebSocket();
