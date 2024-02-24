/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

export default {
	async scheduled(controller, env, ctx) {
		console.log(`Hello World!`);
	},
	async fetch(request, env, ctx) {
		if(request.method === "POST"){
			const payload = await request.json();

			if('message' in payload){
				const chatId = payload.message.chat.id;
				// const input = String(payload.message.text);
				const user_firstname = String(payload.message.from.first_name);
				// const response = user_firstname + " said " + input;
				// await this.sendMessage(chatId, response);
				await this.sendMessage(env.API_KEY, chatId, "Hello, " + user_firstname );
			}
		}
		return new Response('OK');
	},
	async sendMessage(apiKey, chatId, text){
		const url = `https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${chatId}&text=${text}`;
		return await fetch(url).then(resp => resp.json());
	}
};
