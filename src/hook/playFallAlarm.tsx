import alertSound from "../assets/sounds/alarm.mp3";

let alertAudio: HTMLAudioElement | null = null;

export function playFallAlarm() {
  if (!alertAudio) {
    alertAudio = new Audio(alertSound);
    alertAudio.loop = true; // 계속 울리게
  }
  alertAudio.play().catch((e) => console.warn(e));
}

export function stopFallAlarm() {
  if (!alertAudio) return;
  alertAudio.pause();
  alertAudio.currentTime = 0;
}
