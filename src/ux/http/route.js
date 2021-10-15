import { MessageChannel } from 'worker_threads'

function writeResponse(res, code, obj) {
	const body = JSON.stringify(obj)

	// encode the results as bytes in order to apply content length
	const enc = new TextEncoder()
	const ab = enc.encode(body)

	res.writeHead(code, {
		'Access-Control-Allow-Origin': '*',
		'Content-Length': ab.byteLength,
		'Content-Type': 'applicatin/json; charset=utf-8'
	})
	res.write(body)
	res.end()
}


export async function createRouter(options) {

	console.log('binding routes', { options })

	return (req, res) => {
		// construct a url object out of the request url
		// need a dummy base in order to construct properly, however,
		// it is not - and should not - ever be read in the follwoing code
		const reqUrl = new URL(req.url, 'https://dummy')

		const { method, pathname, search } = reqUrl

		// find 'best' pathname for this request
		const canidates = Object.keys(options)
			.filter(key => pathname.startsWith(key))

		const basePathname = canidates
			.find(key => true) // should add subfind based on length of key

		// lookup and validate handler
		const handler = options[basePathname]
		if(handler === undefined || typeof handler !== 'function') {
			// if this is not found, or not a proper function, return 404
			writeResponse(res, 404, { error: 'no handler for path', pathname })
			return
		}

		const channel = new MessageChannel()


		// fire promise for response
		// handler is not async, thus explicit promise with catch required
		// res should realy have a .waitFor(<promis>) method
		handler(method, pathname, search)
			.then(result => writeResponse(res, 200, result))
			.catch(e => writeResponse(res, 200, {
				error: 'exception in handler',
				message: e.message
			}))
	}
}