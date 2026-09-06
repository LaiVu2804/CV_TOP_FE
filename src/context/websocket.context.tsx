import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Client, IMessage, Frame, StompSubscription } from "@stomp/stompjs";
import { useAuth } from "./auth.context";
import { useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";

export interface IWebSocketContext {
  client: Client | null;
  isConnected: boolean;
}

export const WebSocketContext = createContext<IWebSocketContext | null>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const handleReceiveMessage = useCallback(
    (message: IMessage) => {
      try {
        const noti = JSON.parse(message.body);

        console.log(noti);

        notification.info({
          message: noti.title || "Thông báo mới",
          description: noti.content,
          placement: "topRight",
          duration: 5,
        });

        if (noti.type === "RESUME_UPDATE") {
          queryClient.invalidateQueries({ queryKey: ["resumes"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      } catch (error) {
        console.error("Lỗi parse tin nhắn websocket:", error);
      }
    },
    [queryClient]
  );

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!isAuthenticated || !user?.email || !token) {
      return;
    }
    if (!backendUrl) {
      console.error("VITE_BACKEND_URL is not defined");
      return;
    }

    const wsUrl = backendUrl
      .replace(/^https?:\/\//, (m: string) =>
        m === "https://" ? "wss://" : "ws://"
      )
      .replace(/\/$/, "");
    const brokerURL = `${wsUrl}/ws`.replace(/\/{2,}/, "/").replace(":/", "://");

    const stompClient = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("[STOMP]", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    let subscription: StompSubscription | null = null;

    stompClient.onConnect = (frame: Frame) => {
      setIsConnected(true);
      const subscriptionPath = `/topic/user/${user.email}`;
      subscription = stompClient.subscribe(
        subscriptionPath,
        (msg: IMessage) => {
          handleReceiveMessage(msg);
        }
      );
    };

    stompClient.onStompError = (frame: Frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      try {
        if (subscription) {
          subscription.unsubscribe();
          subscription = null;
        }
        stompClient.deactivate();
      } catch (e) {
        console.warn("Error during websocket cleanup", e);
      } finally {
        setIsConnected(false);
        setClient(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.email, handleReceiveMessage]);

  return (
    <WebSocketContext.Provider value={{ client, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};
