import { toast } from "sonner";
import { Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

interface NotificationToastProps {
  notification: NotificationData;
  t: string | number;
}

const NotificationToast = ({ notification, t }: NotificationToastProps) => {
  const navigate = useNavigate();

  const handleViewNotifications = () => {
    navigate("/notifications");
    toast.dismiss(t);
  };

  return (
    <div className="flex items-start gap-3 p-3 min-w-[320px]">
      <div className="flex-shrink-0">
        <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground mb-1">
          {notification.title}
        </div>
        <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {notification.message}
        </div>
        <button
          onClick={handleViewNotifications}
          className="text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors"
        >
          View all notifications
        </button>
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default NotificationToast;
