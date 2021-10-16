import { createServer } from 'http'
import { promises as fs } from 'fs'

export async function createHTTPStaticServer(options) {

	const requestListener = (req, res) => {
		if(req.method !== 'GET') { res.end(); return }

		console.log('Static Server', req.method, req.url)

		const bestRoute = Object.keys(options)
			.filter(key => req.url.startsWith(key))
			.find(() => true) // first

		const irl = options[bestRoute]

		// sync so use promise api
		fs.readFile(irl, 'utf-8')
			.then(file => {
				res.write(file)
				res.end()
			})
			.catch(e => {
				console.log('static server read file error', { e })
				res.statusCode = 404
				res.end()
			})
	}

	return createServer(requestListener)
}
