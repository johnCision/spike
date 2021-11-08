import { MessageChannel } from 'worker_threads'
import { Readable } from 'stream'

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
	const { status, irl, jwt } = redirect
	const expires = new Date(utcNow() + 1000 * 60 * 1).toUTCString()

	const cookie = {
		'Set-Cookie': 'jwt=' + jwt + '; SameSite=None; Secure; Expires=' + expires + '; HttpOnly;'
	}

	res.writeHead(status, {
		'Access-Control-Allow-Origin': '*',
		'Server-Timing': 'message;dur=' + diffMs,
		'Location': irl,
		...cookie
	})
	res.end()
}

function writeBlob(res, diffMs, result) {
	const { blob, mime } = result

	const enc = new TextEncoder()
	const ab = enc.encode(blob)

	res.writeHead(200, {
		'Access-Control-Allow-Origin': '*',
		'Content-Length': ab.byteLength,
		'Content-Type': 'application/json; charset=utf-8',
		'Server-Timing': 'message;dur=' + diffMs
	})
	res.write(blob)
	res.end()
}

function writeEventHead(res) {
	//console.log('write Event Head')
	const BOM = String(0xFEFF)

	res.writeHead(200, {
		'Access-Control-Allow-Origin': '*',
		'Content-type': 'text/event-stream'
	})
	res.write(BOM)
	res.write('\r\n')
}

function writeEvent(res, diffMs, result) {
	//console.log('write Event', result)
	result.lines.forEach(line => res.write(line))
}

function writeOptions(res, options) {
	const allowList = options.join(', ')

	res.writeHead(204, {
		'Allow': allowList,
		'Access-Control-Allow-Origin': '*'
	})
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

		// console.log('Router:', { method, pathname, search })

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

		const isESAccepted = req.headers['accept'] === 'text/event-stream'
		const requestType = isESAccepted ? 'event-stream' : 'http-request'

		if(isESAccepted) { writeEventHead(res) }

		const channel = new MessageChannel()
		const port = channel.port1

		const timer = isESAccepted ? undefined : setTimeout(() => {
			writeResponse(res, 408, utcNow() - startTime, { error: 'timeout' })
		}, 1000 * 1)

		res.on('close', () => {
			// console.log('---response stream closed', requestType, isESAccepted)
			clearTimeout(timer)
			port.close()
		})

		port.on('message', reply => {
			clearTimeout(timer)
			if(reply.options !== undefined) { writeOptions(res, reply.options); return }
			if(reply.event === true) { writeEvent(res, utcNow() - startTime, reply); return }
			if(reply.redirect === true) { writeRedirect(res, utcNow() - startTime, utcNow, reply); return }
			if(reply.blob !== undefined) { writeBlob(res, utcNow() - startTime, reply); return }
			writeResponse(res, 200, utcNow() - startTime, reply)
		})
		port.on('error', e => {
			clearTimeout(timer)
			writeResponse(res, 200, utcNow - startTime, {
				error: 'exception in handler',
				message: e?.message })
		})

		const dec = new TextDecoder()
		let accumulator = ''
		req.on('data', chunk => {
			accumulator += dec.decode(chunk, { stream: true })
		})
		req.on('end', () => {
			accumulator += dec.decode()

			// console.log({ accumulator }, typeof accumulator)

			servicePort.postMessage({
				type: requestType,
				method, pathname, search, body: accumulator,
				replyPort: channel.port2
			}, [ channel.port2 ])
		})

		// servicePort.postMessage({
		// 	type: requestType,
		// 	method, pathname, search,
		// 	replyPort: channel.port2
		// }, [ channel.port2 ])
	}
}
