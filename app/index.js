import { Ai } from './vendor/@cloudflare/ai.js';

addEventListener("fetch", event => {
  event.respondWith(handleRequest());
});

async function handleRequest() {

  const min = 2;
  const max = 2440;
  const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
  // const value = await env.KV_NAMESPACE_BINDING.get(randomInteger.toString());
  const value = await KV_NAMESPACE_BINDING.get(randomInteger.toString());
  const size = value.length > 35 ? "32" : "64"
  const imageUrl = "https%3A%2F%2Fi.imgur.com%2FCypWQYk.jpg"
  let urlMarquee = "https://textoverimage.moesif.com/image?image_url=" +
    imageUrl + "&text=" + encodeURIComponent(value) +
    "&text_color=050505ff&text_size=" + size +
    "&margin=37&y_align=middle&x_align=bottom"

  const ai = new Ai(env.AI);
  const inputs = {
    prompt: value
  };

  const response = await ai.run(
    '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    inputs
  );

  function manualBtoa(input) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';
    let i = 0;

    const pad = input.length % 3;
    const length = input.length - pad;

    // Process each 24-bit chunk
    for (; i < length; i += 3) {
      const chunk = (input.charCodeAt(i) << 16) + (input.charCodeAt(i + 1) << 8) + input.charCodeAt(i + 2);
      output += chars[(chunk >> 18) & 0x3F] + chars[(chunk >> 12) & 0x3F] + chars[(chunk >> 6) & 0x3F] + chars[chunk & 0x3F];
    }

    // Padding
    if (pad) {
      let chunk = input.charCodeAt(i) << 16;
      if (pad === 2) chunk += input.charCodeAt(i + 1) << 8;

      output += chars[(chunk >> 18) & 0x3F] + chars[(chunk >> 12) & 0x3F];
      output += pad === 2 ? chars[(chunk >> 6) & 0x3F] : '=';
      output += '=';
    }

    return output;
  };

  function uint8ArrayToBase64(uint8Array) {
    // Convert the Uint8Array to a binary string
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }

    // Convert the binary string to Base64
    const base64String = manualBtoa(binaryString);
    return base64String;
  };
  const b64 = uint8ArrayToBase64(response);
  const bg = "data:image/png;base64," + b64

  // const bg = ""
  let html = `<!DOCTYPE html>
    <html>
      <head>
        <title>  Workers AI Text-to-Image Sample App using Pulumi </title>
        <style>
          body {
              text-align: center; /* Center align the text and inline elements */
            }
            .image-container {
                position: relative;
              margin: 0 auto; 
              width: 1024px; /* Set your desired container width */
              height: 1024px; /* Set your desired container height */
          }
          .overlay-image {
              position: absolute;
              width: 50%;
              top: 50%; /* Centered from the top */
              left: 50%; /* Centered from the left */
              transform: translate(-50%, -50%); /* Center the image */
              z-index: 1; /* This image will be on top */
          }
          .base-image {
              position: absolute;
              top: 0;
              left: 0;
              width: 80%;
              height: 80%;
              z-index: 0; /* This image will be behind the overlay image */
          }
        </style>
      </head>
      <body>
        <h1>  Cloudflare Workers AI + Pulumi Demo </h1>
        <div class="image-container">
          <img  class="overlay-image" src="${urlMarquee}" alt="Marguee Sign">
          <img  class="base-image" src="${bg}" alt="AI Image">
        </div>
      </body>
    </html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html;charset=UTF-8",
      "Cache-Control": "s-maxage=0",
    },
  });
}