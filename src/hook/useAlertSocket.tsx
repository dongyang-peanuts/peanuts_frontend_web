import { useEffect, useRef } from "react";
import { showPopupNotification } from "@/utils/showPopupNotification";

type AlertCallback = (data: any) => void;

const useAlertSocket = (onAlert?: AlertCallback) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
      }

      const ws = new WebSocket("ws://kongback.kro.kr:8080/ws/alert");
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket 연결 성공");
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log("알림 수신:", data);
          showPopupNotification(data);
          if (onAlert) {
            onAlert(data);
          }
        } catch (err) {
          console.error("메시지 파싱 실패:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket 에러:", err);
        ws.close();
      };
    };

    connect();

    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [onAlert]);
};

export default useAlertSocket;
