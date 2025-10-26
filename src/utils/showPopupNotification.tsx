let lastFallState = false;

export function showPopupNotification(data: any) {
  const {
    eventType,
    detectedAtIso,
    userKey,
    layRate,
    prob,
    fall,
    wanderState,
  } = data;

  if (fall === lastFallState) return;

  lastFallState = fall;

  if (fall) {
    const title = "⚠️ 낙상 감지!";
    const body = `
  감지 시간: ${detectedAtIso}
  사용자 번호: ${userKey}
  낙상 확률: ${prob ?? "-"}%
  layRate: ${layRate ?? "-"}
  `;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") new Notification(title, { body });
      });
    }

    // 화면 상단 팝업 (선택)
    const popup = document.createElement("div");
    popup.innerHTML = `
  <div style="
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    padding: 18px 24px;
    border: 1px solid #f2f2f2;
    position: relative;
    min-width: 340px;
    text-align: center;
    font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  ">
    <div style="
      font-size: 22px;
      color: #e74c3c;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    ">
      비상 상황 발생!
    </div>
    <div style="
      margin-top: 10px;
      font-size: 16px;
      color: #333;
      font-weight: 500;
    ">
      ${body || "구로구 지역 환자에게 비상 상황이 발생했습니다!"}
    </div>
    <div style="
      margin-top: 8px;
      font-size: 14px;
      color: #666;
    ">
      ${detectedAtIso ? new Date(detectedAtIso).toLocaleString() : ""}
    </div>
    <div style="
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid white;
      position: absolute;
      bottom: -10px;
    "></div>
  </div>
`;

    popup.style.position = "fixed";
    popup.style.top = "80px"; // 지도 위 중앙 근처
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.zIndex = "9999";
    popup.style.opacity = "0";
    popup.style.transition = "opacity 0.3s ease-in-out";
    setTimeout(() => (popup.style.opacity = "1"), 10);

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 7000); // 7초 뒤 사라짐
  } else {
    console.log("낙상 해제");
  }
}
