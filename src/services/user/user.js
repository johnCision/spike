import { workerData, parentPort } from 'worker_threads'

async function handleMessage(_message, options = {}) {
	// bound to something like /api/user

	// GET
	//
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
