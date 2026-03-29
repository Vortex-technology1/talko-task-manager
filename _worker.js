// Cloudflare Pages - pass-through worker (static site only)
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  }
};
