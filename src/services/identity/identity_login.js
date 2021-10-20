import { workerData, parentPort } from 'worker_threads'

const CLIENT_ID_FIELD_NAME = 'client_id'

async function handleMessage(message, options = {}) {
	//
	// step 1) GET /login?client_id -> redirect(303, provider_url)
	const { search, replyPort } = message

	const sp = new URLSearchParams(search)
	if(!sp.has(CLIENT_ID_FIELD_NAME)) {
		replyPort.postMessage({ error: 'missing client id' })
		return
	}

	const client_id = sp.get(CLIENT_ID_FIELD_NAME)

	const { clients } = options

	const irl = clients[client_id]

	if(irl === undefined) {
		replyPort.postMessage({ error: 'invalid client id' })
		return
	}

	// at this point we should be sending a postMessage({ callBackExpected })
	// out to the service bus such that it can prepar itself for the incomeing
	// request.  this also could be used to track those request that do not
	// get send back to the callback (success, abandoned, failure etc)
	console.log('sending client to go auth, should get a callback soon')

	// cheep version of validating the irl, should be on init not every request
	const _url = new URL(irl)

	// send back a magic message that tell http to redirect
	replyPort.postMessage({
		redirect: true,
		status: 303,
		irl
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
