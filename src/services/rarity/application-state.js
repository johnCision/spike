import { parentPort, workerData } from 'worker_threads'

const linkForStates = {
	settings: [
		{ rel: 'settings', irn: 'irn:rarity/settings', irl: 'https://localhost:8080/service/settings' }
	],
	questionnaire: [
		{
			rel: 'questionnaire',
			irn: 'irn:rarity/questionnaire',
			irl: 'https://localhost:8080/service/questionnaire'
		},
		{
			rel: 'watch',
			irn: 'irn:spike/ux/ws/questionnaire/rarity'
		}
	],
	dashboard: [
		{
			rel: 'dashboard',
			irn: 'irn:rarity/dashboard',
			irl: 'https://localhost:8080/service/dashboard'
		}
	],
	communityHome: [
		{ rel: 'communitySearch', irn: 'irn:rarity/search/community' }
	]
}


async function handleMessage(message, options = {}) {
	//
	const { _search, replyPort } = message
	const { _machine } = options

	const state = 'questionnaire'

	replyPort.postMessage({
		links: linkForStates[state]
	})
}

function handleMessageSync(message, options) {
	handleMessage(message, options)
		.then()
		.catch(e => console.warn({ e }))
}

function handleErrorSync(err) {
	console.warn({ err })
}

//
parentPort.on('message', msg => handleMessageSync(msg, workerData))
parentPort.on('error', handleErrorSync)
