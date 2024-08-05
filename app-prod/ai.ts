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
import { Request, ExecutionContext, Element } from '@cloudflare/workers-types';

export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "AI" with the variable name you defined.
	AI: any;
}

// This is the entry point for the Worker script
export default {
	// The fetch event handler for the Worker script
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		const quote = "";

		///////////////////////////////////////////////////////////////////////
		// Run the AI model via Universal Endpoint
    // https://developers.cloudflare.com/ai-gateway/providers/universal/
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
		
		return new Response(bg, {
				status: 200,
				headers: {
					"content-type": "image/png",
					"Cache-Control": "s-maxage=0",
					'Expires': new Date().toUTCString()
				},
			});
	},
};
