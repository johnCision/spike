import { workerData, parentPort } from 'worker_threads'

async function handleMessage(_message, options = {}) {
	//
	// step 1) GET /login?client_id -> redirect(provider_url)
	// step 2) GET /callback?client_id&provider_code -> redirect(application_url) + JWT

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
