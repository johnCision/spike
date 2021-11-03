/* eslint-disable fp/no-mutation */
/* eslint-disable immutable/no-mutation */
import { workerData, parentPort, MessageChannel } from 'worker_threads'

const state = {
	bridgeQueue: []
}

const bridgeChannel = new MessageChannel()

bridgeChannel.port2.on('message', msg => {
	//console.log('bridgeChannel port2 on message', msg, bridgeQueue)

	if(msg.transfer) {
		console.log('transfer port to bridge queue')
		state.bridgeQueue = [ ...state.bridgeQueue, msg.port ]
		msg.port.on('close', () => {
			console.log('--- close transferred port, remove from q')
			state.bridgeQueue = state.bridgeQueue.filter(port => port !== msg.port)
		})
		return
	}

	console.log('broadcast to bridge queue', state.bridgeQueue.length)
	state.bridgeQueue.forEach(replyPort => {
		replyPort.postMessage({
			event: true,
			lines: [
				'data: ' + JSON.stringify({ message: msg.message }) + '\n',
				'\n\n'
			]
		})
	})
})

//
async function handleMessage(message, options = {}) {
	const { replyPort, type, method, body } = message

	if(type === 'http-request' && method === 'POST') {

		console.log('post message to chat', body)
		console.log('parse body?', body)
		const bodyJson = JSON.parse(body)

		bridgeChannel.port1.postMessage({ message: bodyJson.message })

		replyPort.postMessage({ created: true })
		return
	}

	//
	if(type === 'http-request' && method === 'OPTIONS') {
		replyPort.postMessage({ options: [ 'POST', 'HEAD', 'OPTIONS', 'GET' ] })
		return
	}

	if(type === 'event-stream') {

		console.log('pushing port to bridge queue')
		bridgeChannel.port1.postMessage({ transfer: true, port: replyPort }, [ replyPort ])
		bridgeChannel.port1.postMessage({ message: 'welcome to chat 🥳' })
		replyPort.postMessage({ event: true })
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
