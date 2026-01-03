export default {
  async fetch(request, env, ctx) {
    // Serve static assets; normalize missing files to 404 instead of bubbling to 500.
    try {
      const res = await env.ASSETS.fetch(request);
      if (res.status === 404) {
        return new Response("Not Found", { status: 404 });
      }
      return res;
    } catch (err) {
      return new Response("Not Found", { status: 404 });
    }
  },
};
