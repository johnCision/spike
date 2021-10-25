import { promises as fs } from 'fs'
import { workerData, parentPort } from 'worker_threads'

async function handleMessage(message, options = {}) {
	const { replyPort, pathname, search } = message

	// mime type

	const pathNameLocal = pathname.replace('/service/blob', '') // todo router normalized pathnameLocal



	const path = './src/ux.env.json'
	const blob = await fs.readFile(path, { flag: 'r', encoding: 'utf-8' })

	replyPort.postMessage({ blob })
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
