/** One demand-driven frame loop shared by scrolling and decorative motion. */
const subscribers = new Set();
let frame = 0;
function tick(time) {
  frame = 0;
  for (const callback of [...subscribers]) callback(time);
  if (subscribers.size && !frame) frame = requestAnimationFrame(tick);
}
export function animate(callback) {
  subscribers.add(callback);
  if (!frame) frame = requestAnimationFrame(tick);
  return () => {
    subscribers.delete(callback);
    if (!subscribers.size) { cancelAnimationFrame(frame); frame = 0; }
  };
}
