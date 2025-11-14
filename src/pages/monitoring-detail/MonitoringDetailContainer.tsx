import { useEffect, useRef, useState } from "react";
import MonitoringDetailView from "./MonitoringDetailView";
import axios from "axios";

const USER_KEY = 22;

const MonitoringDetailContainer = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const date = new Date();
  const [data, setData] = useState<any>();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`/admin/users/${USER_KEY}`)
      .then((res) => {
        console.log("user data:", res.data);
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`/admin/users/alerts/${USER_KEY}`)
      .then((res) => {
        console.log("초기 history:", res.data);
        setHistory(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    const wsUrl = `ws://kongback.kro.kr:8080/user/alert`;
    console.log("alerts WebSocket 연결 시도:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("alerts WebSocket 연결 성공");
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        console.log("실시간 alert 수신:", msg);

        setHistory((prev) => (prev ? [...prev, msg] : [msg]));
      } catch (error) {
        console.error("alert 메시지 파싱 실패:", error, e.data);
      }
    };

    ws.onerror = (err) => {
      console.error("alerts WebSocket 에러:", err);
    };

    ws.onclose = (e) => {
      console.warn("alerts WebSocket 종료:", {
        code: e.code,
        reason: e.reason,
        clean: e.wasClean,
      });
    };

    return () => {
      console.log("MonitoringDetailContainer unmount → WS close");
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  if (!data) {
    return <div>로딩중입니다...</div>;
  }

  return <MonitoringDetailView date={date} data={data} history={history} />;
};

export default MonitoringDetailContainer;
