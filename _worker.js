// Cloudflare Pages Worker - pass through to static assets
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
}
