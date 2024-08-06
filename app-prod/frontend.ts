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
import {  Request, ExecutionContext, Element } from '@cloudflare/workers-types';

export interface Env {

  WORKER_DB_SERVICE: any;
  WORKER_AI_SERVICE: any;
}

// This is the entry point for the Worker script
export default {
	// The fetch event handler for the Worker script
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

		
    const quote = await env.WORKER_DB_SERVICE.fetch(request);
    
    // TODO -- add the quote
    const quoteRequest = new Request(request, {
      method: 'POST', // For example, change method to POST
      headers: new Headers({
        ...request.headers,
      }),
      body: quote 
    });
		const bg = await env.WORKER_AI_SERVICE.fetch(quoteRequest);

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
