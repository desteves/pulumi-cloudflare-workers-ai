/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Ai } from "@cloudflare/ai";
import html from '../public/index.html';

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	KV: KVNamespace;
	// AI: AIBinding;

	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;

}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		/////////////////////////////////////////////////
		// 1. Retrieve a random quote from the KV Namespace
		const count = await env.KV.get("count") || "0";
		const key = (Math.floor(Math.random() * parseInt(count)) + 1).toString();
		const quote = await env.KV.get(key) || "No quote found.";


		/////////////////////////////////////////////////
		// (helper function) Convert a Uint8Array to a base64 string
		function manualBtoa(input: string) {
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
		/////////////////////////////////////////////////
		// (helper function)
		function uint8ArrayToBase64(uint8Array: Uint8Array) {
			// Convert the Uint8Array to a binary string
			let binaryString = '';
			for (let i = 0; i < uint8Array.length; i++) {
				binaryString += String.fromCharCode(uint8Array[i]);
				console.log(binaryString)
			}

			// Convert the binary string to Base64
			const base64String = manualBtoa(binaryString);
			return base64String;
		};

		/////////////////////////////////////////////////
		// 2. Run the AI model via Bindings to the AI Service
		// @ts-ignore
		const ai = new Ai(env.AI);
		const img = await ai.run(
			"@cf/bytedance/stable-diffusion-xl-lightning",
			{
				prompt: quote
			}
		);
		console.log(img);
		const bg = "data:image/png;base64," + uint8ArrayToBase64(img);
		// const r = new Response(img, {
		// 	headers: {
		// 		"content-type": "image/png",
		// 	},
		// });
		// const bg  = await r.text();
		// const bg = new ImageDecoder({ data: resp, type: "image/png" });

		/////////////////////////////////////////////////
		// 3. Display the quote + generated image
		// https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/#properties
		class ElementHandler {
			element(element: Element) {
				if (element.getAttribute("class") == "base-image") {
					element.setAttribute("src", bg);
					element.after("<p class='overlay-text'>" + quote + "</p>", { html: true });
				}
			}
		}
		return new HTMLRewriter()
			.on("img", new ElementHandler())
			.transform(new Response(html, {
				status: 200,
				headers: {
					"content-type": "text/html;charset=UTF-8",
					"Cache-Control": "s-maxage=0",
					'Expires': new Date().toUTCString()
				},
			}))
	},
};
