export interface Env {
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
}

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=60, s-maxage=300",
  "access-control-allow-origin": "*",
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
    if (url.pathname === "/health") return Response.json({ ok: true });

    const edition = url.pathname.endsWith("update.json") ? "share" : "personal";
    if (url.pathname !== "/update-personal.json" && url.pathname !== "/update.json") {
      return new Response("Not Found", { status: 404 });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    const apiUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/releases/latest`;
    const releaseResponse = await fetch(apiUrl, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "sku-tool-update-worker",
        "x-github-api-version": "2022-11-28",
      },
    });
    if (!releaseResponse.ok) {
      console.error(JSON.stringify({ event: "github_release_error", status: releaseResponse.status }));
      return Response.json({ error: "Unable to read latest release" }, { status: 502 });
    }

    const release = await releaseResponse.json() as {
      tag_name: string;
      body?: string;
      assets: Array<{ name: string; browser_download_url: string }>;
    };
    const assetName = edition === "personal" ? "sku-tool-personal.exe" : "sku-tool-share.exe";
    const asset = release.assets.find(item => item.name === assetName);
    if (!asset) return Response.json({ error: `Missing release asset: ${assetName}` }, { status: 502 });

    const payload = {
      version: release.tag_name.replace(/^v/i, ""),
      url: asset.browser_download_url,
      notes: release.body || "发现新版本，建议立即更新。",
    };
    const response = new Response(JSON.stringify(payload), { headers: jsonHeaders });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    console.log(JSON.stringify({ event: "update_manifest", edition, version: payload.version }));
    return response;
  },
};
