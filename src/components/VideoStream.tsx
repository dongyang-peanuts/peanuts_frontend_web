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

  useEffect(() => {
    const connect = () => {
      const url = "ws://172.20.10.2:8765/monitor";
      const ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS connected:", url);
        setIsConnected(true);
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

      ws.onerror = (err) => console.error("WS error:", err);
      ws.onclose = (e) => {
        console.warn("⚠️ WS closed:", e);
        setIsConnected(false);
        setTimeout(connect, 2000); // 재연결 시도
      };
    };

    // DOM 안정화 후 연결 (React 초기 렌더 끝난 뒤)
    const timer = setTimeout(connect, 300);

    return () => {
      clearTimeout(timer);
      if (wsRef.current) wsRef.current.close();
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
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
          {isConnected ? "📡 영상 수신 중…" : "⏳ 서버 연결 중…"}
        </div>
      )}
    </div>
  );
}
