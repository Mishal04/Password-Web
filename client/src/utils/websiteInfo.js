/**
 * Returns favicon URL, display title, and hostname for a given URL.
 *
 * Favicon source priority (handled via onError chains in img tags):
 *   1. DuckDuckGo CDN  — best coverage, works for github.com etc.
 *   2. Google S2       — broad fallback
 *   3. Site's own /favicon.ico
 *   4. Letter-avatar   — last resort (handled in JSX)
 */
export const getWebsiteInfo = (url) => {
  if (!url) return { title: "", favicon: "", faviconFallback: "", domain: "" };

  try {
    const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
    const parsedUrl    = new URL(formattedUrl);
    const hostname     = parsedUrl.hostname.replace("www.", "");
    const domain       = hostname.split(".")[0];
    const title        = domain.charAt(0).toUpperCase() + domain.slice(1);

    // Primary: DuckDuckGo favicon CDN (best GitHub / dev-site coverage)
    const favicon = `https://icons.duckduckgo.com/ip3/${hostname}.ico`;

    // Fallback 1: Google S2 (broad coverage, ~128 px)
    const faviconFallback = `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;

    // Fallback 2: site's own favicon.ico
    const faviconDirect = `${parsedUrl.protocol}//${parsedUrl.hostname}/favicon.ico`;

    return { title, favicon, faviconFallback, faviconDirect, domain: hostname };
  } catch {
    return { title: "", favicon: "", faviconFallback: "", faviconDirect: "", domain: "" };
  }
};
