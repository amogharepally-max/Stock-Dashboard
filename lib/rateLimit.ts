// Simple in-memory rate limiter for Finnhub free tier (60 calls/min)
// Queues requests and spaces them out to stay under the limit.

const CALLS_PER_MINUTE = 55; // stay a bit under 60
const INTERVAL_MS = (60 * 1000) / CALLS_PER_MINUTE;

let lastCallTime = 0;
let queue: (() => void)[] = [];
let processing = false;

function processQueue() {
  if (queue.length === 0) {
    processing = false;
    return;
  }
  processing = true;
  const now = Date.now();
  const wait = Math.max(0, lastCallTime + INTERVAL_MS - now);
  setTimeout(() => {
    const fn = queue.shift();
    if (fn) {
      lastCallTime = Date.now();
      fn();
    }
    processQueue();
  }, wait);
}

export function rateLimitedFetch(url: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    queue.push(() => {
      fetch(url).then(resolve).catch(reject);
    });
    if (!processing) processQueue();
  });
}
