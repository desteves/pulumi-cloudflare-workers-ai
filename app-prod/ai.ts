/**
 * @fileoverview Given a text prompt, it generates a representative PNG image and returns it as part of the response.
 * */

// This is the entry point for the Worker script
export default {
  // The fetch event handler for the Worker script
  async fetch(request, env, ctx) {

    ///////////////////////////////////////////////////////////////////////
    // Run the AI model via the AI Gateway
    // https://developers.cloudflare.com/ai-gateway/providers/workersai/
    ///////////////////////////////////////////////////////////////////////
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `${env.AI_MODEL_SECRET_KEY}`);

    const raw = JSON.stringify({
      "prompt": new URL(request.url).searchParams.get('prompt') ?? "Where did the phrase Hello World come from",
      "num_steps": 1
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    const blob =
      await fetch(
        `https://gateway.ai.cloudflare.com/v1/${env.ACCOUNT_ID}/${env.GATEWAY_ID}/workers-ai/${env.AI_MODEL_ENDPOINT}`,
        requestOptions
      ).then((response) => response.blob());


    return new Response(blob, {
      headers: {
        'content-type': 'image/png',
      },
    });
  },
};
