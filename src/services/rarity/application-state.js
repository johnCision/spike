import { workerData, parentPort } from 'worker_threads'

async function handleMessage(message, options = {}) {
	//
	const { _search, replyPort } = message
	const { _machine } = options

	replyPort.postMessage({
		_state: 'questionnaire',

		links: [
			{
				rel: 'questionnaire',
				//irn: 'irn:spike/ux/service/questionnaire'
				irn: 'https://localhost:8080/service/questionnaire'
			},
			{
				rel: 'watch',
				irn: 'irn:spike/ux/ws/questionnaire/rarity'
			}
		]
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
