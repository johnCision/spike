import { MessageChannel } from 'worker_threads'

function writeResponse(res, code, diffMs, obj) {
	const body = JSON.stringify(obj)

	// encode the results as bytes in order to apply content length
	const enc = new TextEncoder()
	const ab = enc.encode(body)

	res.writeHead(code, {
		'Access-Control-Allow-Origin': '*',
		'Content-Length': ab.byteLength,
		'Content-Type': 'application/json; charset=utf-8',
		'Server-Timing': 'message;dur=' + diffMs
	})
	res.write(body)
	res.end()
}

function writeRedirect(res, diffMs, utcNow, redirect) {
	const { status, irl } = redirect
	const expires = new Date(utcNow() + 1000 * 60 * 1).toUTCString()

	const cookie = {
		'Set-Cookie': 'this=that; SameSite=None; Secure; Expires=' + expires + ';'
	}

	res.writeHead(status, {
		'Access-Control-Allow-Origin': '*',
		'Server-Timing': 'message;dur=' + diffMs,
		'Location': irl,
		...cookie
	})
	res.end()
}


export async function createRouter(options, utcNow) {
	return (req, res) => {
		const startTime = utcNow()

		// construct a url object out of the request url
		// need a dummy base in order to construct properly, however,
		// it is not - and should not - ever be read in the following code
		const reqUrl = new URL(req.url, 'https://dummy')

		const { pathname, search } = reqUrl
		const { method } = req

		console.log('Router:', { method, pathname, search })

		// find 'best' pathname for this request
		const candidate = Object.keys(options)
			.filter(key => pathname.startsWith(key))

		const basePathname = candidate
			.find(_key => true) // should add find based on length of key

		// lookup and validate handler
		const servicePort = options[basePathname]
		if(servicePort === undefined) {
			// if this is not found, or not a proper function, return 404
			writeResponse(res, 404, utcNow() - startTime, { error: 'no handler for path', pathname })
			return
		}

		const channel = new MessageChannel()
		const port = channel.port1


		const timer = setTimeout(() => {
			writeResponse(res, 408, utcNow() - startTime, { error: 'timeout' })
		}, 1000 * 1)

		port.on('message', reply => {
			clearTimeout(timer)
			if(reply.redirect === true) { writeRedirect(res, utcNow() - startTime, utcNow, reply); return }
			writeResponse(res, 200, utcNow() - startTime, reply)
		})
		port.on('error', e => {
			clearTimeout(timer)
			writeResponse(res, 200, utcNow - startTime, {
				error: 'exception in handler',
				message: e?.message })
		})

		servicePort.postMessage({
			type: 'http-request',
			method, pathname, search,
			replyPort: channel.port2
		}, [ channel.port2 ])
	}
}
