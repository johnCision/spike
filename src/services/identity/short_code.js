import { workerData, parentPort } from 'worker_threads'

async function handleMessage(message, options = {}) {
	//
	// get JWT from temp code
	const { search, replyPort } = message

	const sp = new URLSearchParams(search)
	if(!sp.has('code')) {
		replyPort.postMessage({ error: 'missing code' })
		return
	}

	const jwt = { email: '', avatarIrl: '' }

	replyPort.postMessage({
		jwt
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
// const { client_id, client_secret, cert } = workerData
parentPort.on('message', msg => handleMessageSync(msg, workerData))
parentPort.on('error', handleErrorSync)
