import { workerData, parentPort } from 'worker_threads'
import { promises as fs } from 'fs'

import jsonwebtoken from 'jsonwebtoken'

async function handleMessage(message, options = { }) {
	const { replyPort, search } = message

	const sp = new URLSearchParams(search)
	if(!sp.has('jwt')) {
		replyPort.postMessage({ error: 'missing jwt' })
		return
	}

	const jwt = sp.get('jwt')

	// TODO move to spike file read setup phase (no fs in workers)
	const publicKey = await fs.readFile(options.jwtPublicKeyIrl)

	const jwtoptions = {
		//expiresIn: '5 min',
		algorithm: 'RS256'
		// subject: ''
	}

	const { email, exp } = await new Promise((resolve, reject) => {
		jsonwebtoken.verify(jwt, publicKey, (e, decoded) => {
			if(e) { reject(e); return }
			resolve(decoded)
		})
	})

	// TODO check exp

	const userInfo = options.users[email]

	if(userInfo === undefined) {
		console.log({ email })
		replyPort.postMessage({ ok: false, message: 'no info for user' })
		return
	}

	replyPort.postMessage(userInfo)
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
