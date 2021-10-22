import { workerData, parentPort } from 'worker_threads'

async function handleMessage(message, options = {}) {
	//
	const { _search, replyPort } = message
	const { machine } = options

	replyPort.postMessage({
		state: 'questionnaire',
		link: [
			{
				rel: 'validate',
				irn: 'irn:spike/ux/service/rarity/app?validate'
			},
			{
				rel: 'submit',
				irn: 'irn:spike/ux/service/rarity/app?validate'
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
