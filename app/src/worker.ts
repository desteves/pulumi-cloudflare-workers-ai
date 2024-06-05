/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Test the Worker locally:
 * 		- Run `npx wrangler@latest dev` in your terminal to start a development server
 *		- Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Deploy the Worker:
 * 		- Run `npx wrangler@latest publish` to deploy your Worker to the Cloudflare edge
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// @ts-ignore
import html from '../public/index.html';
import { KVNamespace, Request, ExecutionContext, Element } from '@cloudflare/workers-types';

export interface Env {
	KV: KVNamespace;
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "AI" with the variable name you defined.
	AI: any;
}

// This is the entry point for the Worker script
export default {
	// The fetch event handler for the Worker script
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		///////////////////////////////////////////////////////////////////////
		// 1. Retrieve a random quote from the KV Namespace
		///////////////////////////////////////////////////////////////////////
		const defaultQuote = "What's a purple platypus's favorite ride? An orange cloud, of course!";
		const count = env?.KV ? await env.KV.get("count") ?? "0" : "0";
		const key = (Math.floor(Math.random() * parseInt(count)) + 1).toString();
		const quote = env?.KV ? await env.KV.get(key) ?? defaultQuote : defaultQuote


		///////////////////////////////////////////////////////////////////////
		// 2. Run the AI model via Bindings to the AI Service
		///////////////////////////////////////////////////////////////////////
		const result = await env.AI.run("@cf/bytedance/stable-diffusion-xl-lightning", {
			// @ts-ignore
			prompt: quote
		}).then((stream) =>
			new Response(stream, { headers: { "Content-Type": "image/png" } }).arrayBuffer(),
		);
		const bg = "data:image/png;base64," + btoa(
			new Uint8Array(result)
				.reduce((data, byte) => data + String.fromCharCode(byte), '')
		);
		

		///////////////////////////////////////////////////////////////////////
		// 3. Display the quote + generated image
		///////////////////////////////////////////////////////////////////////
		// https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/#properties
		class ElementHandler {
			element(element: Element) {
				if (element.getAttribute("class") == "base-image") {
					element.setAttribute("src", bg);
					element.after("<p class='overlay-text'>" + quote + "</p>", { html: true });
				}
			}
		}
		// https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/#transform
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
