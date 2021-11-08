import { workerData, parentPort } from 'worker_threads'


const toppings = [
	{ key: 'pepperoni', vegan: false },
	{ key: 'sausage', vegan: false, upCharge: true },
	{ key: 'onion', vegan: true },
	{ key: 'mushroom', vegan: true },
	{ key: 'pineapple', vegan: true, upCharge: true }
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
