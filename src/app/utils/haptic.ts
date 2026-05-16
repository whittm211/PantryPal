export function haptic(pattern: 'tap' | 'success' | 'warning' = 'tap') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  if (pattern === 'success') navigator.vibrate([10, 30, 10]);
  else if (pattern === 'warning') navigator.vibrate([20, 40, 20, 40]);
  else navigator.vibrate(8);
}
