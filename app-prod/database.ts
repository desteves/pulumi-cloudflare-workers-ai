/**
 * @fileoverview Selects a random KV entry from the KV Namespace and returns it as a text response.
 * */

// This is the entry point for the Worker script
export default {
  // The fetch event handler for the Worker script
  async fetch(request, env, ctx) {

    ///////////////////////////////////////////////////////////////////////
    // Retrieve a random quote from the KV Namespace
    ///////////////////////////////////////////////////////////////////////
    const defaultQuote = "What's a purple platypus's favorite ride? An orange cloud, of course!";
    const count = env?.KV ? await env.KV.get("count") ?? "0" : "0";
    const key = (Math.floor(Math.random() * parseInt(count) - 1) + 2).toString();
    const quote = env?.KV ? await env.KV.get(key) ?? defaultQuote : defaultQuote

    return new Response(quote, {
      status: 200,
      headers: {
        "content-type": "text/plain;charset=UTF-8",
        "Cache-Control": "s-maxage=0",
        'Expires': new Date().toUTCString()
      },
    });
  },
};
