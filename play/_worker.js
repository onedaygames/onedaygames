const OFFLINE_PREFIXES = [
  "/trash-dice/beta-v2",
  "/trash-dice/qr-test",
  "/private/trash-dice-alpha-complete-dc5a995",
  "/partner/big-discoveries",
];

const ALPHA_PREFIX = "/trash-dice/alpha-complete";
const WUYB_ALPHA_PREFIX = "/wuyb/alpha-complete";
const WUYB_LOGIN_PATH = `${WUYB_ALPHA_PREFIX}/login`;
const WUYB_LOGOUT_PATH = `${WUYB_ALPHA_PREFIX}/logout`;
const WUYB_PREVIEW_PREFIX = "/private/wuyb-preview";
const WUYB_ALPHA_VERSION = "7cf0045";
const WUYB_SESSION_COOKIE = "odg_wuyb_alpha_session";
const WUYB_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const IOS_PREVIEW_PREFIX = "/trash-dice/ios-preview";
const BOPIT_PREFIX = "/private/bop-it";
const BOPIT_REALM = "Bop Phone Prototype";
const PLAY_REVIEW_PREFIX = "/trash-dice/play";
const ALPHA_USER = "odg";
const PLAY_REVIEW_REALM = "Trash Dice Play Review";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function isAlphaPath(pathname) {
  return pathname === ALPHA_PREFIX || pathname.startsWith(`${ALPHA_PREFIX}/`);
}

function isWuybAlphaPath(pathname) {
  return pathname === WUYB_ALPHA_PREFIX || pathname.startsWith(`${WUYB_ALPHA_PREFIX}/`);
}

function isWuybAlphaHomePath(pathname) {
  return pathname === WUYB_ALPHA_PREFIX ||
    pathname === `${WUYB_ALPHA_PREFIX}/` ||
    pathname === `${WUYB_ALPHA_PREFIX}/index.html`;
}

function isWuybLoginPath(pathname) {
  return pathname === WUYB_LOGIN_PATH || pathname === `${WUYB_LOGIN_PATH}/`;
}

function isWuybLogoutPath(pathname) {
  return pathname === WUYB_LOGOUT_PATH || pathname === `${WUYB_LOGOUT_PATH}/`;
}

function isWuybPreviewPath(pathname) {
  return pathname === WUYB_PREVIEW_PREFIX || pathname.startsWith(`${WUYB_PREVIEW_PREFIX}/`);
}

function isIosPreviewPath(pathname) {
  return pathname === IOS_PREVIEW_PREFIX || pathname.startsWith(`${IOS_PREVIEW_PREFIX}/`);
}

function isBopItPath(pathname) {
  return pathname === BOPIT_PREFIX || pathname.startsWith(`${BOPIT_PREFIX}/`);
}

function isPlayReviewPath(pathname) {
  return pathname === PLAY_REVIEW_PREFIX || pathname.startsWith(`${PLAY_REVIEW_PREFIX}/`);
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

function protectedRedirect(target, status = 302, extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  headers.set("location", target.toString());
  headers.set("cache-control", "no-store");
  headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return new Response(null, { status, headers });
}

function defaultWuybPlayUrl(url) {
  const target = new URL(url);
  target.pathname = `${WUYB_ALPHA_PREFIX}/`;
  target.search = "";
  target.searchParams.set("match", "1");
  target.searchParams.set("v", WUYB_ALPHA_VERSION);
  return target;
}

function redirectToWuybAlpha(url) {
  const target = new URL(url);
  target.pathname = target.pathname.replace(/^\/private\/wuyb-preview(?=\/|$)/, WUYB_ALPHA_PREFIX);
  if (target.pathname === WUYB_ALPHA_PREFIX) {
    target.pathname = `${WUYB_ALPHA_PREFIX}/`;
  }
  if (isWuybAlphaHomePath(target.pathname) && !target.searchParams.has("match") && !target.searchParams.has("hunt")) {
    target.searchParams.set("match", "1");
  }
  if (isWuybAlphaHomePath(target.pathname) && !target.searchParams.has("v")) {
    target.searchParams.set("v", WUYB_ALPHA_VERSION);
  }
  return protectedRedirect(target);
}

function sanitizeWuybNext(rawNext, baseUrl) {
  const fallback = defaultWuybPlayUrl(baseUrl).toString();
  if (!rawNext) return fallback;

  try {
    const candidate = new URL(String(rawNext), baseUrl);
    if (candidate.origin !== baseUrl.origin) return fallback;
    if (!isWuybAlphaPath(candidate.pathname)) return fallback;
    if (isWuybLoginPath(candidate.pathname) || isWuybLogoutPath(candidate.pathname)) return fallback;
    return candidate.toString();
  } catch {
    return fallback;
  }
}

function redirectToWuybLogin(url) {
  const target = new URL(`${WUYB_LOGIN_PATH}/`, url);
  target.searchParams.set("next", sanitizeWuybNext(url.toString(), url));
  return protectedRedirect(target);
}

function unauthorized(realm = "Trash Dice Alpha Complete") {
  return new Response("authentication required", {
    status: 401,
    headers: {
      "www-authenticate": `Basic realm="${realm}", charset="UTF-8"`,
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

function getAlphaPassword(env) {
  return env.ODG_ALPHA_PASSWORD || env.TRASH_DICE_ALPHA_PASSWORD || "";
}

function hasAlphaAccess(request, env) {
  const expectedPassword = getAlphaPassword(env);
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char]));
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function signWuybSession(payload, password) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(`wuyb-alpha-session:${password}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function getCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const [cookieName, ...valueParts] = part.trim().split("=");
    if (cookieName === name) return valueParts.join("=");
  }
  return "";
}

async function createWuybSessionCookie(password) {
  const payload = bytesToBase64Url(textEncoder.encode(JSON.stringify({
    scope: "wuyb-alpha-complete",
    exp: Math.floor(Date.now() / 1000) + WUYB_SESSION_TTL_SECONDS,
  })));
  const signature = await signWuybSession(payload, password);
  return `${WUYB_SESSION_COOKIE}=${payload}.${signature}; Path=${WUYB_ALPHA_PREFIX}; Max-Age=${WUYB_SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
}

function clearWuybSessionCookie() {
  return `${WUYB_SESSION_COOKIE}=; Path=${WUYB_ALPHA_PREFIX}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

async function hasWuybSessionAccess(request, env) {
  const expectedPassword = getAlphaPassword(env);
  if (!expectedPassword) return null;

  const token = getCookie(request, WUYB_SESSION_COOKIE);
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSignature = await signWuybSession(payload, expectedPassword);
  if (!constantTimeEqual(signature, expectedSignature)) return false;

  try {
    const session = JSON.parse(textDecoder.decode(base64UrlToBytes(payload)));
    return session.scope === "wuyb-alpha-complete" &&
      Number.isFinite(session.exp) &&
      session.exp >= Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

async function hasWuybRequestAccess(request, env) {
  const basicAllowed = hasAlphaAccess(request, env);
  if (basicAllowed === true) return true;
  if (basicAllowed === null) return null;
  return hasWuybSessionAccess(request, env);
}

async function protectedAssetResponse(request, env) {
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

async function alphaResponse(request, env, realm) {
  const allowed = hasAlphaAccess(request, env);
  if (allowed === null) return authNotConfigured();
  if (!allowed) return unauthorized(realm);

  return protectedAssetResponse(request, env);
}

function renderWuybLoginPage(url, options = {}) {
  const status = options.status || 200;
  const next = sanitizeWuybNext(options.next || url.searchParams.get("next"), url);
  const error = options.error ? `<p class="login-error" role="alert">${escapeHtml(options.error)}</p>` : "";

  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <title>WUYB Alpha Complete Login</title>
  <style>
    :root {
      color-scheme: dark;
      --ink: #f7f2dc;
      --muted: #aeb9c5;
      --panel: #101622;
      --field: #070b12;
      --line: #2b3d4c;
      --mint: #66efc8;
      --gold: #ffd23f;
      --rose: #ff5278;
      --shadow: #00000073;
    }
    * { box-sizing: border-box; }
    html, body { min-height: 100%; margin: 0; }
    body {
      color: var(--ink);
      background:
        linear-gradient(135deg, #070a10 0%, #15101b 46%, #081914 100%);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .login-shell {
      min-height: 100svh;
      display: grid;
      place-items: center;
      padding: 28px;
    }
    .login-panel {
      width: min(100%, 430px);
      border: 1px solid var(--line);
      border-radius: 8px;
      background: color-mix(in srgb, var(--panel) 92%, black);
      padding: clamp(24px, 6vw, 34px);
      box-shadow: 0 22px 70px var(--shadow);
    }
    .brand-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 26px;
    }
    .brand-mark {
      width: 46px;
      height: 46px;
      border: 3px solid var(--mint);
      border-radius: 6px;
      display: grid;
      place-items: center;
      color: var(--gold);
      font-weight: 1000;
      font-size: 24px;
      line-height: 1;
      box-shadow: 0 0 28px color-mix(in srgb, var(--mint) 38%, transparent);
    }
    .eyebrow {
      margin: 0;
      color: var(--mint);
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0;
      text-transform: uppercase;
    }
    h1 {
      margin: 2px 0 0;
      font-size: clamp(28px, 7vw, 38px);
      line-height: .96;
      letter-spacing: 0;
    }
    form {
      display: grid;
      gap: 16px;
    }
    label {
      display: grid;
      gap: 7px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
    }
    input {
      width: 100%;
      border: 2px solid var(--line);
      border-radius: 6px;
      background: var(--field);
      color: var(--ink);
      min-height: 48px;
      padding: 11px 12px;
      font: 800 16px/1.2 inherit;
      letter-spacing: 0;
      outline: none;
    }
    input:focus {
      border-color: var(--mint);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--mint) 22%, transparent);
    }
    button {
      border: 0;
      border-radius: 6px;
      min-height: 52px;
      margin-top: 4px;
      background: var(--mint);
      color: #06120e;
      cursor: pointer;
      font: 1000 16px/1.1 inherit;
      letter-spacing: 0;
      box-shadow: 0 6px 0 #16836c;
    }
    button:active {
      transform: translateY(4px);
      box-shadow: 0 2px 0 #16836c;
    }
    .login-error {
      margin: 0;
      border-left: 4px solid var(--rose);
      border-radius: 4px;
      background: color-mix(in srgb, var(--rose) 14%, transparent);
      color: #ffd6df;
      padding: 10px 12px;
      font-size: 14px;
      font-weight: 800;
      line-height: 1.35;
    }
    .status-line {
      margin: 22px 0 0;
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <main class="login-shell">
    <section class="login-panel" aria-labelledby="login-title">
      <div class="brand-row">
        <div class="brand-mark" aria-hidden="true">W</div>
        <div>
          <p class="eyebrow">One Day Games</p>
          <h1 id="login-title">WUYB Alpha Complete</h1>
        </div>
      </div>
      <form method="post" action="${WUYB_LOGIN_PATH}/">
        <input type="hidden" name="next" value="${escapeHtml(next)}" />
        ${error}
        <label>
          Username
          <input name="username" autocomplete="username" value="${ALPHA_USER}" required />
        </label>
        <label>
          Password
          <input name="password" type="password" autocomplete="current-password" required />
        </label>
        <button type="submit">Sign in</button>
      </form>
      <p class="status-line">Protected Alpha review · No indexing · One Day Games</p>
    </section>
  </main>
</body>
</html>`, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

async function handleWuybLogin(request, env) {
  const url = new URL(request.url);
  if (request.method !== "POST") {
    const allowed = await hasWuybRequestAccess(request, env);
    if (allowed === null) return authNotConfigured();
    if (allowed) {
      return protectedRedirect(new URL(sanitizeWuybNext(url.searchParams.get("next"), url)), 303);
    }
    return renderWuybLoginPage(url);
  }

  const expectedPassword = getAlphaPassword(env);
  if (!expectedPassword) return authNotConfigured();

  let form;
  try {
    form = await request.formData();
  } catch {
    return renderWuybLoginPage(url, {
      status: 400,
      error: "Could not read that login attempt.",
    });
  }

  const username = String(form.get("username") || "").trim();
  const password = String(form.get("password") || "");
  const next = sanitizeWuybNext(form.get("next") || url.searchParams.get("next"), url);

  if (username !== ALPHA_USER || password !== expectedPassword) {
    return renderWuybLoginPage(url, {
      status: 401,
      error: "That login did not match.",
      next,
    });
  }

  return protectedRedirect(new URL(next), 303, {
    "set-cookie": await createWuybSessionCookie(expectedPassword),
  });
}

async function wuybAlphaResponse(request, env) {
  const allowed = await hasWuybRequestAccess(request, env);
  if (allowed === null) return authNotConfigured();
  if (!allowed) return redirectToWuybLogin(new URL(request.url));

  return protectedAssetResponse(request, env);
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

    if (isWuybPreviewPath(url.pathname)) {
      return redirectToWuybAlpha(url);
    }

    if (isWuybAlphaHomePath(url.pathname) && !url.searchParams.has("match") && !url.searchParams.has("hunt")) {
      return redirectToWuybAlpha(url);
    }

    if (isWuybLoginPath(url.pathname)) {
      return handleWuybLogin(request, env);
    }

    if (isWuybLogoutPath(url.pathname)) {
      const target = new URL(`${WUYB_LOGIN_PATH}/`, url);
      return protectedRedirect(target, 303, {
        "set-cookie": clearWuybSessionCookie(),
      });
    }

    if (isAlphaPath(url.pathname) || isIosPreviewPath(url.pathname)) {
      return alphaResponse(request, env);
    }

    if (isWuybAlphaPath(url.pathname)) {
      return wuybAlphaResponse(request, env);
    }

    if (isPlayReviewPath(url.pathname)) {
      return alphaResponse(request, env, PLAY_REVIEW_REALM);
    }

    if (isBopItPath(url.pathname)) {
      return alphaResponse(request, env, BOPIT_REALM);
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
