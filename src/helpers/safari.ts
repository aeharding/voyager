export function fixSafariAutoscroll() {
  let checkAttempts = 0;

  const interval = setInterval(() => {
    window.scrollTo(0, 0);

    if (window.scrollY === 0) {
      checkAttempts++;

      if (checkAttempts > 10) clearInterval(interval);
    }
  }, 100);
}
