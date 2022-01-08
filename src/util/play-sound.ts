export function playSound(src: string, loop: boolean = false) {
  const alarm = new Audio();
  alarm.src = src;
  alarm.loop = loop;
  alarm.volume = 0.5;
  alarm.play();
}
