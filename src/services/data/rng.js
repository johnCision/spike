import { workerData, parentPort } from 'worker_threads'

// async generator
async function *random() {
	while(true) {
		yield Math.random()
	}
}

// grab a worker global generator
const rng = random()

//
async function handleMessage(message, options = {}) {
	const { replyPort, type } = message

	if(type === 'http-request') {
		const value = await rng.next()
		replyPort.postMessage({ value })
		return
	}

	if(type === 'event-stream') {
		// const timer = setInterval(() => {
		// 	console.log('timer ....')
		// 	rng.next()
		// 		.then(value => {
		// 			replyPort.postMessage({
		// 				event: true,
		// 				lines: [
		// 					'data: ' + JSON.stringify({ value }) + '\n',
		// 					': now is the time\n',
		// 					'\r\n'
		// 				]
		// 			})
		// 		})
		// }, 25 * 1000)


		for await(const value of rng) {
			replyPort.postMessage({
				event: true,
				lines: [
					'data: ' + JSON.stringify({ value }) + '\n',
					'\r\n'
				]
			})
		}


	}
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
