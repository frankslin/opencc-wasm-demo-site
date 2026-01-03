export default {
  async fetch(request, env, ctx) {
    // The static assets from the dist directory will be served automatically
    // This worker will handle any custom logic if needed
    return env.ASSETS.fetch(request);
  },
};
