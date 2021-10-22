import { workerData, parentPort } from 'worker_threads'

async function handleMessage(message, options = {}) {
	//
	const { _search, replyPort } = message
	const { machine } = options





	//replyPort.postMessage({	})
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
const { machineIrl } = workerData

parentPort.on('message', msg => handleMessageSync(msg, workerData))
parentPort.on('error', handleErrorSync)
