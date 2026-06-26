"use client";

import { useEffect, useState } from "react";

type ToastMessage = {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
};

export default function WebSocketAlerts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      console.log("Connecting to ResQNest WebSocket at ws://localhost:8080/ws/live...");
      ws = new WebSocket("ws://localhost:8080/ws/live");

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          let title = "System Notification";
          let body = "New event received";
          let shouldToast = false;

          if (type === "NEW_SOS") {
            title = "🚨 EMERGENCY SOS Alert!";
            body = data.message || `Priority ${data.priorityScore} request submitted by ${data.name || "Victim"}`;
            shouldToast = true;
          } else if (type === "VOLUNTEER_ACCEPTED") {
            title = "👷 Volunteer Dispatched!";
            body = `Volunteer #${data.volunteerId} accepted mission: "${data.message || ""}"`;
            shouldToast = true;
          } else if (type === "RELIEF_DELIVERED") {
            title = "📦 Relief Mission Completed!";
            body = `SOS mission "${data.message || ""}" resolved successfully!`;
            shouldToast = true;
          }

          if (shouldToast) {
            const id = Math.random().toString(36).substring(2, 9);
            const newToast: ToastMessage = {
              id,
              type,
              title,
              body,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setToasts((prev) => [...prev, newToast]);

            // Auto dismiss toast after 6 seconds
            setTimeout(() => {
              setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 6000);
          }
        } catch (err) {
          console.error("Error parsing WebSocket message content:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed. Reconnecting in 5 seconds...");
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket connection encountered an error:", err);
        ws?.close();
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 w-full max-w-sm px-4 md:px-0">
      {toasts.map((toast) => {
        let borderClass = "border-l-4 border-secondary";
        let icon = "notifications";
        let iconColor = "text-secondary";

        if (toast.type === "NEW_SOS") {
          borderClass = "border-l-4 border-primary";
          icon = "emergency";
          iconColor = "text-primary";
        } else if (toast.type === "VOLUNTEER_ACCEPTED") {
          borderClass = "border-l-4 border-secondary";
          icon = "volunteer_activism";
          iconColor = "text-secondary";
        } else if (toast.type === "RELIEF_DELIVERED") {
          borderClass = "border-l-4 border-green-600";
          icon = "task_alt";
          iconColor = "text-green-600";
        }

        return (
          <div
            key={toast.id}
            className={`bg-white rounded-xl shadow-2xl p-4 flex gap-3 items-start relative animate-slide-in border border-outline-variant ${borderClass} transition-all duration-300 hover:scale-[1.02]`}
          >
            <span className={`material-symbols-outlined ${iconColor} text-2xl mt-0.5`}>
              {icon}
            </span>
            <div className="flex-1 pr-6">
              <h5 className="font-bold text-on-surface text-sm leading-tight mb-1">
                {toast.title}
              </h5>
              <p className="text-xs text-on-surface-variant font-medium leading-normal">
                {toast.body}
              </p>
              <span className="text-[9px] font-bold text-outline uppercase mt-2 block tracking-wider">
                {toast.time}
              </span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="absolute top-3 right-3 text-outline hover:text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
