import { useEffect, useRef, useState } from "react";

function normalizeBase64(src: string) {
  let s = src.startsWith("data:image") ? src.split(",").pop()! : src;
  s = s.replace(/\s/g, "");
  const rem = s.length % 4;
  if (rem > 0) s = s + "=".repeat(4 - rem);
  return s;
}

function base64ToBlob(b64: string, mime = "image/jpeg") {
  const binStr = atob(b64);
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

interface CctvProps {
  width: number;
  height: number;
}

export default function CctvWeb({ width, height }: CctvProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  const prevUrlRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    const url = "ws://172.20.10.2:8765/monitor";

    const clearImageUrl = () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
      setImgSrc("");
    };

    const scheduleReconnect = () => {
      if (unmountedRef.current) return;

      // 이미 예약된 재연결 시도가 있으면 또 안 잡음
      if (reconnectTimerRef.current !== null) return;

      console.warn("⏳ 2000ms 후 WebSocket 재연결 시도");

      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, 2000);
    };

    const connect = () => {
      // 이미 연결되어 있거나 연결 중이면 다시 만들지 않음
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      console.log("🔌 WebSocket 연결 시도:", url);
      const ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS connected:", url);
        setIsConnected(true);

        // 연결 성공했으니 재연결 타이머는 필요 없음
        if (reconnectTimerRef.current !== null) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      ws.onmessage = (e) => {
        if (typeof e.data === "string") {
          try {
            let b64: string;
            if (e.data.trim().startsWith("{")) {
              const obj = JSON.parse(e.data);
              b64 = String(obj?.image ?? obj?.data ?? "").trim();
            } else {
              b64 = e.data.trim();
            }
            if (!b64) return;

            const normalized = normalizeBase64(b64);
            const mime = b64.includes("data:image/png")
              ? "image/png"
              : "image/jpeg";
            const blob = base64ToBlob(normalized, mime);

            const objUrl = URL.createObjectURL(blob);
            if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
            prevUrlRef.current = objUrl;
            setImgSrc(objUrl);
            return;
          } catch (err) {
            console.warn("문자열 프레임 처리 실패:", err);
            setImgSrc(`data:image/jpeg;base64,${e.data}`);
            return;
          }
        }

        let blob: Blob;
        if (e.data instanceof Blob) {
          blob = e.data.type
            ? e.data
            : new Blob([e.data], { type: "image/jpeg" });
        } else {
          blob = new Blob([e.data], { type: "image/jpeg" });
        }
        const objUrl = URL.createObjectURL(blob);
        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = objUrl;
        setImgSrc(objUrl);
      };

      ws.onerror = (err) => {
        console.error("WS error:", err);
        setIsConnected(false);
        clearImageUrl();

        // 에러 나면 소켓 닫고 → onclose에서 재연결 시도
        try {
          ws.close();
        } catch (_) {}
      };

      ws.onclose = (e) => {
        console.warn("⚠️ WS closed:", e);
        setIsConnected(false);
        clearImageUrl();
        scheduleReconnect(); // ★ 실패/종료 시에만 재연결 예약
      };
    };

    // 초기 1회 연결 시도
    connect();

    return () => {
      unmountedRef.current = true;

      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
      }

      if (wsRef.current) {
        try {
          wsRef.current.onopen = null;
          wsRef.current.onmessage = null;
          wsRef.current.onerror = null;
          wsRef.current.onclose = null;
          wsRef.current.close();
        } catch (e) {
          console.warn("WebSocket cleanup error:", e);
        }
      }

      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);

  return (
    <div
      className="bg-white flex items-center justify-center"
      style={{ width, height }}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          width={width}
          height={height}
          alt="CCTV"
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
          onError={() => {
            console.warn("이미지 렌더링 실패");
            setImgSrc("");
          }}
        />
      ) : (
        <div style={{ padding: 12 }}>
          {isConnected ? "📡 영상 수신 중…" : "⏳ 서버 연결 시도 중…"}
        </div>
      )}
    </div>
  );
}
