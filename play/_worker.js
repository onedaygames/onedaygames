const OFFLINE_PREFIXES = [
  "/trash-dice",
  "/private/trash-dice-alpha-complete-dc5a995",
  "/partner/big-discoveries",
];

function isOfflinePath(pathname) {
  return OFFLINE_PREFIXES.some((prefix) => (
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  ));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (isOfflinePath(url.pathname)) {
      return new Response("not found", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
          "x-robots-tag": "noindex, nofollow, noarchive",
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
