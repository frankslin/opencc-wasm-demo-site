export default {
  async fetch(request, env, ctx) {
    return new Response('OpenCC WASM Demo Site', {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  },
};
