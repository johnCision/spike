import { workerData, parentPort } from 'worker_threads'


const toppings = [
	{ key: Symbol('pepperoni'), vegan: false },
	{ key: Symbol('sausage'), vegan: false },
	{ key: Symbol('onion'), vegan: true },
	{ key: Symbol('mushroom'), vegan: true },
	{ key: Symbol('pineapple'), vegan: true }
]

async function handleMessage(message, options = {}) {
	//
	const { replyPort } = message
	replyPort.postMessage({ toppings })
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
