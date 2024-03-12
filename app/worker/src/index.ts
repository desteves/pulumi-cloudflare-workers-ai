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
// @ts-ignore
import html from '../public/index.html';
// @ts-ignore
import favicon from '../public/favicon.ico';

export interface Env {
	KV: KVNamespace;
	AI: any;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		/////////////////////////////////////////////////
		// 1. Retrieve a random quote from the KV Namespace
		const count = await env.KV.get("count") || "0";
		const key = (Math.floor(Math.random() * parseInt(count)) + 1).toString();
		const quote = await env.KV.get(key) || "No quote found.";

		/////////////////////////////////////////////////
		// 2. Run the AI model via Bindings to the AI Service
		const ai = new Ai(env.AI);
		const result = await ai.run(
			"@cf/bytedance/stable-diffusion-xl-lightning",
			{
				prompt: quote,
				num_steps: 1,
			}
		).then((stream) =>
			new Response(stream, { headers: { "Content-Type": "image/png" } }).arrayBuffer(),
		);
		console.log(result);
		const bg = "data:image/png;base64," + btoa(
			new Uint8Array(result)
				.reduce((data, byte) => data + String.fromCharCode(byte), '')
		);
		console.log(bg);
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
