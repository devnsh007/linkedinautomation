export default {
  async fetch(request: Request) {
    return new Response("LinkedIn OAuth Worker is running!", {
      headers: { "content-type": "text/plain" },
    });
  },
};
