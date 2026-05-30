const OFFLINE_PREFIXES = [
  "/trash-dice/beta-v2",
  "/trash-dice/play",
  "/trash-dice/qr-test",
  "/private/trash-dice-alpha-complete-dc5a995",
  "/partner/big-discoveries",
];

const ALPHA_PREFIX = "/trash-dice/alpha-complete";
const ALPHA_USER = "odg";

function isAlphaPath(pathname) {
  return pathname === ALPHA_PREFIX || pathname.startsWith(`${ALPHA_PREFIX}/`);
}

function isOfflinePath(pathname) {
  return OFFLINE_PREFIXES.some((prefix) => (
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  ));
}

function isLiveIndexPath(pathname) {
  return pathname === "/live" || pathname === "/live/";
}

function isDoubleLivePath(pathname) {
  return pathname === "/live/live" || pathname === "/live/live/" || pathname.startsWith("/live/live/");
}

function redirectToHome(url) {
  const target = new URL("/", url);
  return Response.redirect(target.toString(), 302);
}

function redirectToSingleLive(url) {
  const target = new URL(url);
  target.pathname = target.pathname.replace(/^\/live\/live(?=\/|$)/, "/live");
  return Response.redirect(target.toString(), 302);
}

function unauthorized() {
  return new Response("authentication required", {
    status: 401,
    headers: {
      "www-authenticate": `Basic realm="Trash Dice Alpha Complete", charset="UTF-8"`,
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

function authNotConfigured() {
  return new Response("authentication not configured", {
    status: 503,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

function hasAlphaAccess(request, env) {
  const expectedPassword = env.TRASH_DICE_ALPHA_PASSWORD;
  if (!expectedPassword) return null;

  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Basic\s+(.+)$/i);
  if (!match) return false;

  try {
    const [user, password] = atob(match[1]).split(":");
    return user === ALPHA_USER && password === expectedPassword;
  } catch {
    return false;
  }
}

async function alphaResponse(request, env) {
  const allowed = hasAlphaAccess(request, env);
  if (allowed === null) return authNotConfigured();
  if (!allowed) return unauthorized();

  const response = await env.ASSETS.fetch(request);
  const headers = new Headers(response.headers);
  headers.set("cache-control", "no-store");
  headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (isLiveIndexPath(url.pathname)) {
      return redirectToHome(url);
    }

    if (isDoubleLivePath(url.pathname)) {
      return redirectToSingleLive(url);
    }

    if (isAlphaPath(url.pathname)) {
      return alphaResponse(request, env);
    }

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
