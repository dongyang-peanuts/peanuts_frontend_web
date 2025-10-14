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

export default function CctvWeb() {
  const [imgSrc, setImgSrc] = useState<string>("");
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const url = "ws://172.20.10.2:8765/monitor";
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => console.log("WS connected:", url);

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
    ws.onclose = (e) =>
      console.warn("WS closed:", {
        code: e.code,
        reason: e.reason,
        clean: e.wasClean,
      });

    return () => {
      ws.close();
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  return (
    <div style={{ width: 546, height: 404, border: "1px solid #000" }}>
      {imgSrc ? (
        <img
          src={imgSrc}
          width={546}
          height={404}
          alt="CCTV"
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
          onError={(e) => {
            console.warn("이미지 렌더링 실패");
            setImgSrc("");
          }}
        />
      ) : (
        <div style={{ padding: 12 }}>📡 실시간 영상 수신 중…</div>
      )}
    </div>
  );
}
