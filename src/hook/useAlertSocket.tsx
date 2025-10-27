import { useEffect, useRef } from "react";
import { showPopupNotification } from "@/utils/showPopupNotification";

const useAlertSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
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
  }, []);
};

export default useAlertSocket;
