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

function getStr() {
	return '❤️'.repeat( 256 );
}

export default {
	async scheduled(controller, env, ctx) {
		const subscribers = JSON.parse(await env.GEN.get("subscribers") || '[]')

		for( const s of subscribers )
			await this.sendMessage(env.API_KEY, s.chatId, getStr());
	},
	async fetch(request, env, ctx) {
		if(request.method === "POST"){
			const payload = await request.json();

			if ( 'inline_query' in payload ) {
				await this.answerInlineQuery(env.API_KEY, payload);
				return new Response('OK');
			}

			if('message' in payload){
				const chatId = payload.message.chat.id;
				// const input = String(payload.message.text);
				// const user_firstname = String(payload.message.from.first_name);
				// const response = user_firstname + " said " + input;
				// await this.sendMessage(chatId, response);
				// await this.sendMessage(env.API_KEY, chatId, "Hello, " + user_firstname );


				const subscribers = JSON.parse(await env.GEN.get("subscribers") || '[]')
				if ( !subscribers.some(s => +s.chatId === +chatId) ) {
					subscribers.push({chatId})
					await this.sendMessage(env.API_KEY, chatId, getStr() );
					await env.GEN.put('subscribers', JSON.stringify(subscribers))
				}
				else if ( payload.message.text === '/get' ) {
					await this.sendMessage(env.API_KEY, chatId, "You have already got your Daily Hearts..." );
					await this.sendMessage(env.API_KEY, chatId, "Anyway...\n" + getStr()  );
				}
			}
		}
		return new Response('OK');
	},
	async sendMessage(apiKey, chatId, text){
		const url = `https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${chatId}&text=${text}`;
		return await fetch(url).then(resp => resp.json());
	},
	async answerInlineQuery(apiKey, {inline_query: query}) {
		const url = `https://api.telegram.org/bot${apiKey}/answerInlineQuery`;

		const body = {
			inline_query_id: query.id,
			cache_time: 5,
			results: JSON.stringify([
				{
					type: 'article',
					id: (+new Date()).toString(16),
					title: '❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️',
					message_text: getStr()
				}
			])
		};

		return await fetch(url  + '?' + new URLSearchParams(body))
			.then(resp => resp.json())
	},
};
