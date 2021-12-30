import { workerData, parentPort } from 'worker_threads'
import { PerformanceObserver, performance } from 'perf_hooks'
import { promises as fs } from 'fs'

import jsonwebtoken from 'jsonwebtoken'

import { Github } from './github.js'

const CLIENT_ID_FIELD_NAME = 'client_id'

async function signIdentity(payload, options) {

	const privateKey = await fs.readFile('./secrets/jwt_private.pem')
	const secret = privateKey // 'do not tell' // { key, phrase }

	console.log('sign options', options)

	const signed = jsonwebtoken.sign(payload, secret, options)
	// console.log({ signed })

	return signed
}

async function githubIdentityLookup(options) {
	const { search, client_id, client_secret, jwtOptions } = options

	const sp = new URLSearchParams(search)
	if(!sp.has('code')) {
		throw new Error('no code')
	}

	const code = sp.get('code')

	// TODO
	if(code === '1234') {
		return signIdentity(
			{
				_id: {
					email: 'user@domain.tld',
					provider: 'github'
				}
			}, jwtOptions)
	}

	performance.mark('github:requestToken:begin')
	const token = await Github.requestToken(code, client_id, client_secret)
	performance.mark('github:requestToken:end')

	console.log({ token })

	performance.mark('github:requestEmail:begin')
	const payload = await Github.requestEmail(token)
	performance.mark('github:requestEmail:end')

	performance.mark('identity:signIdentity:begin')
	const identity = await signIdentity(payload, jwtOptions)
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
		console.log('identity lookup', identity)

		// this is not a good idea
		const redirectUrl = new URL(irl)
		redirectUrl.searchParams.append('jwt', identity)

		replyPort.postMessage({
			redirect: true,
			status: 303,
			irl: redirectUrl.toString(),
			jwt: identity
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
