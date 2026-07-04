// Guarded PWA service worker registration.
// Refuses to register in dev, iframes, Lovable preview hosts, or with ?sw=off.

const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterMatching(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      regs
        .filter((r) => {
          const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
          return url.endsWith(SW_URL);
        })
        .map((r) => r.unregister()),
    );
  } catch {
    /* noop */
  }
}

export function registerSW(): void {
  if (!("serviceWorker" in navigator)) return;
  if (isRefusedContext()) {
    void unregisterMatching();
    return;
  }
  void (async () => {
    try {
      const { Workbox } = await import("workbox-window");
      const wb = new Workbox(SW_URL);
      wb.addEventListener("waiting", () => {
        // autoUpdate strategy: skip waiting on next reload
        void wb.messageSkipWaiting();
      });
      await wb.register();
    } catch (err) {
      // Silent failure — offline is a progressive enhancement.
      console.warn("[pwa] SW registration failed", err);
    }
  })();
}
