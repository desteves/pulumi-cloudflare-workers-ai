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
        const value = await environment.KV_NAMESPACE_BINDING.get(randomInteger.toString());
        const size = value.length > 35 ? "32" : "64"
        const imageUrl = "https%3A%2F%2Fi.imgur.com%2FCypWQYk.jpg"
        const urlMarquee = "https://textoverimage.moesif.com/image?image_url=" +
            imageUrl + "&text=" + encodeURIComponent(value) +
            "&text_color=050505ff&text_size=" + size +
            "&margin=37&y_align=middle&x_align=bottom"

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
        //     '@cf/bytedance/stable-diffusion-xl-lightning',
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
            environment.T2IMODEL;

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + environment.CF_ACCT_TOKEN
            },
            body: JSON.stringify({
                prompt: value,
                num_steps: 1, 
            }
            ),
        };
        const response = await fetch(url, fetchOptions);
        const binary = await response.arrayBuffer();
        const bg = "data:image/png;base64," + uint8ArrayToBase64(new Uint8Array(binary));
        /////////////////////////////////////////////////

        class ImageSrcRewriter {

            element(element) {
                // Use this method to change the `src` attribute of the img element
                if (element.getAttribute("class") == "overlay-image") {
                    element.setAttribute("src", urlMarquee);
                } else if (element.getAttribute("class") == "base-image") {
                    element.setAttribute("src", bg);
                }
            }
        }
        return new HTMLRewriter()
            .on("img", new ImageSrcRewriter())
            .transform(new Response(html, {
                status: 200,
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                    "Cache-Control": "s-maxage=0",
                },
            }))

    },
}