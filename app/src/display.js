// @ts-ignore
// import { Ai } from '@cloudflare/ai';
// @ts-ignore
// import { Ai } from './vendor/@cloudflare/ai.js';

import html from '../public/index.html';

export default {
    async fetch(request, environment, context) {

        const min = 2;
        const max = 20;
        const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
        const quote = await environment.KV_NAMESPACE_BINDING.get(randomInteger.toString());

        console.log("random quote");
        console.log(quote);

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

        /////////////////////////////////////////////////
        // Run the AI model via Bindings, not yet available programmatically
        // requires AI Binding, must be manually added 
        // const ai = new Ai(environment.AI);
        // const inputs = {
        //     prompt: value
        // };
        // const aiimg = await ai.run(
        //     environment.MODEL_TEXT_TO_IMAGE,
        //     inputs
        // );
        // const bg = "data:image/png;base64," + uint8ArrayToBase64(aiimg);
        /////////////////////////////////////////////////


        /////////////////////////////////////////////////
        // Temporary way to use the AI models via the API Endpoint
        // Use available model
        //'@cf/stabilityai/stable-diffusion-xl-base-1.0',
        // Model not yet available 
        // '@cf/bytedance/stable-diffusion-xl-lightning',

        const url = "https://gateway.ai.cloudflare.com/v1/" +
            environment.CF_ACCT_ID +
            "/ai/workers-ai/" +
            environment.MODEL_TEXT_TO_IMAGE;

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + environment.CF_ACCT_TOKEN
            },
            body: JSON.stringify({
                prompt: quote,
            }
            ),
        };
        const response = await fetch(url, fetchOptions);
        const binary = await response.arrayBuffer();
        const bg = "data:image/png;base64," + uint8ArrayToBase64(new Uint8Array(binary));
        /////////////////////////////////////////////////

        // https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/#properties
        class ElementHandler {
            element(element) {
                if (element.getAttribute("class") == "base-image") {
                    element.setAttribute("src", bg);
                    element.after("<p class='overlay-text'>" + quote + "</p>", { html: true });
                }
            }
        }
        return new HTMLRewriter()
            .on("*", new ElementHandler())
            .transform(new Response(html, {
                status: 200,
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                    "Cache-Control": "s-maxage=0",
                    'Expires': new Date().toUTCString()
                },
            }))

    },
}