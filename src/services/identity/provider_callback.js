import { workerData, parentPort } from 'worker_threads'
import { PerformanceObserver, performance } from 'perf_hooks'

import { Github } from './github.js'

const CLIENT_ID_FIELD_NAME = 'client_id'

async function signIdentity(email) {
	return { email, signed: true }
}

async function githubIdentityLookup(options) {
	const { search, client_id, client_secret } = options

	const sp = new URLSearchParams(search)
	if(!sp.has('code')) {
		throw new Error('no code')
	}

	const code = sp.get('code')

	performance.mark('github:requestToken:begin')
	const token = await Github.requestToken(code, client_id, client_secret)
	performance.mark('github:requestToken:end')

	console.log({ token })

	performance.mark('github:requestEmail:begin')
	const email = await Github.requestEmail(token)
	performance.mark('github:requestEmail:end')

	performance.mark('identity:signIdentity:begin')
	const identity = await signIdentity(email)
	performance.mark('identity:signIdentity:end')

	performance.measure(
		'github:requestToken',
		'github:requestToken:begin', 'github:requestToken:end')
	performance.measure(
		'github:requestEmail',
		'github:requestEmail:begin', 'github:requestEmail:end')
	performance.measure(
		'identity:signIdentity',
		'identity:signIdentity:begin', 'identity:signIdentity:end')

	return identity
}


async function handleMessage(message, options = {}) {
	//
	// step 2) GET /callback?client_id&provider_code -> redirect(application_url) + JWT
	// https://localhost:8080/service/identity/callback?client_id=rarity_client_id&code=a4810a278fca9fe64722&state=NOISE
	//
	const { replyPort, search } = message

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

	try {
		const identity = await githubIdentityLookup({ search, ...options })

		replyPort.postMessage({
			redirect: true,
			status: 303,
			irl,
			identity
		})

	} catch (e) {
		replyPort.postMessage({
			error: 'identity lookup failure',
			message: e.message
		})
	}
}

function handleMessageSync(message, options) {
	handleMessage(message, options)
		.then() // log handler complete for tracking
		.catch(e => console.warn({ e })) // should we replyPort.postMessage(err)
}

function handleErrorSync(err) {
	console.warn({ err }) // should we replyPort.postMessage(err)
}

//
parentPort.on('message', msg => handleMessageSync(msg, workerData))
parentPort.on('error', handleErrorSync)
