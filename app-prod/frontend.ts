/**
 * @fileoverview Renders the HTML for the Serverless App's frontend.
 * */

// This is the entry point for the Worker script
export default {
  // The fetch event handler for the Worker script
  async fetch(request, env, ctx) {

    const quote = await env.WORKER_DB_SERVICE.fetch(request).then((response) => response.text());

    const url = new URL(request.url);
    url.pathname = "/ai/"
    url.searchParams.set('prompt', encodeURIComponent(quote));
    // Create a new Request object with the modified URL
    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      redirect: 'follow'
    });
    const response = await env.WORKER_AI_SERVICE.fetch(modifiedRequest);
    const arrayBuffer = await response.arrayBuffer();
    // Convert ArrayBuffer to base64 string
    const base64String = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Create a data URL
    const dataUrl = `data:${response.headers.get('content-type')};base64,${base64String}`;
    const html = `<!DOCTYPE html>
<html>

<head>
    <title> Cloudflare and Pulumi </title>
    <link rel="icon" href="favicon.ico" type="image/x-icon">

    <style>
        body {
            text-align: center;
            /* Center align the text and inline elements */
        }

        .image-container {
            position: relative;
            margin: 0 auto;
            width: 1024px;
            /* Set your desired container width */
            height: 1024px;
            /* Set your desired container height */
        }

        .overlay-image {
            position: absolute;
            width: 50%;
            top: 50%;
            /* Centered from the top */
            left: 50%;
            /* Centered from the left */
            transform: translate(-50%, -50%);
            /* Center the image */
            z-index: 1;
        }

        .overlay-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: black;
            font-size: 24px;
            font-weight: bold;
            text-align: left;
            background-color: rgba(255, 255, 255, 0);
            padding: 20px 30px;
            z-index: 2;
        }

        .base-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            /* This image will be behind the overlay image */
        }
    </style>
</head>

<body>
    <h1> Serverless AI on Cloudflare Workers AI deployed with Pulumi </h1>
    <div class="image-container">
        <img class="overlay-image" src="https://i.imgur.com/CypWQYk.jpg" alt="Marguee Sign">
        <img id="base-image" class="base-image" src="${dataUrl}" alt="AI Image">
        <p class='overlay-text'>${quote}</p>
    </div>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  },
};
