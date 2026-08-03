import crypto from "crypto";

// Auto-posts to X (Twitter) via the v2 API using OAuth 1.0a user context.
// Activates only when all four credentials are present in the environment;
// otherwise it logs the composed post (dev-mode) and does nothing, exactly like
// the email/Telegram dev-mode pattern. Getting write access requires an X
// developer app (a paid tier for write) and these four secrets:
//   TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET

const ENDPOINT = "https://api.twitter.com/2/tweets";

function rfc3986(str: string): string {
  return encodeURIComponent(str).replace(
    /[!*'()]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
}

function creds() {
  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;
  if (apiKey && apiSecret && accessToken && accessSecret) {
    return { apiKey, apiSecret, accessToken, accessSecret };
  }
  return null;
}

function authHeader(c: NonNullable<ReturnType<typeof creds>>): string {
  const oauth: Record<string, string> = {
    oauth_consumer_key: c.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: c.accessToken,
    oauth_version: "1.0",
  };
  // Signature base string. The JSON body is not part of the OAuth signature and
  // this endpoint has no query params, so only the oauth_* params are signed.
  const paramString = Object.keys(oauth)
    .sort()
    .map((k) => `${rfc3986(k)}=${rfc3986(oauth[k])}`)
    .join("&");
  const base = ["POST", rfc3986(ENDPOINT), rfc3986(paramString)].join("&");
  const signingKey = `${rfc3986(c.apiSecret)}&${rfc3986(c.accessSecret)}`;
  const signature = crypto.createHmac("sha1", signingKey).update(base).digest("base64");
  const header: Record<string, string> = { ...oauth, oauth_signature: signature };
  return (
    "OAuth " +
    Object.keys(header)
      .sort()
      .map((k) => `${rfc3986(k)}="${rfc3986(header[k])}"`)
      .join(", ")
  );
}

export interface PostResult {
  sent: boolean;
  devMode?: boolean;
  id?: string;
  error?: string;
}

/** Post a tweet. No-op (dev-mode log) when credentials are not configured. */
export async function postToX(text: string): Promise<PostResult> {
  const trimmed = text.length > 280 ? text.slice(0, 279) + "…" : text;
  const c = creds();
  if (!c) {
    console.log(`[twitter:dev-mode] would post: ${trimmed}`);
    return { sent: false, devMode: true };
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: authHeader(c),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: trimmed }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[twitter] post failed ${res.status}: ${body}`);
      return { sent: false, error: `${res.status}: ${body}` };
    }
    const json: any = await res.json().catch(() => ({}));
    return { sent: true, id: json?.data?.id };
  } catch (err: any) {
    console.error("[twitter] post error:", err?.message || err);
    return { sent: false, error: err?.message || String(err) };
  }
}
