import * as http2 from 'http2'
import * as fs from 'fs'

const {
	HTTP2_HEADER_PATH,
	HTTP2_HEADER_STATUS,
	HTTP2_METHOD_POST,
	HTTP2_HEADER_METHOD,
	HTTP2_HEADER_ACCEPT,
	HTT2_HEADER_METHOD,
	HTTP2_METHOD_GET,
	HTTP2_HEADER_SCHEME
} = http2.constants

const UTF8_ENCODING = 'utf8'

function gitFetch(urlStr, token) {
	return new Promise((resolve, reject) => {
		const url = new URL(urlStr)

		const path = url.href.replace(url.origin, '')
		const authority = url.origin

		console.log({ authority, path, token })

		const client = http2.connect(authority, {
			//ca: fs.readFileSync('./secrets/localhost-cert.pem')
		})

		client.on('error', err => reject(err))
		client.on('origin', origins => console.log({ origins }))
		client.on('stream', stream => console.log({ stream }))
		client.on('connect', session => console.log({ session }))

		const req = client.request({
			[HTTP2_HEADER_SCHEME]: url.scheme,
			[HTT2_HEADER_METHOD]: [HTTP2_METHOD_GET],
			[HTTP2_HEADER_PATH]: path,
			authorization: 'Basic ' + btoa(':' + token)
		})

		req.on('response', (headers, flags) => {
			console.log({ headers, flags })
		})

		req.setEncoding('utf8')
		let data = ''
		req.on('data', chunk => { console.log(chunk);  data += chunk })
		req.on('end', () => {

			client.close()

			console.log({ data })
			try {
				const json = JSON.parse(data)
				resolve(json)

			} catch (e) { console.log('reject from json parse', e); reject(e) }


		})

		req.end()
	})
}

export class Github {
	static async requestToken(code, client_id, client_secret) {

		// 'https://github.com/login/oauth/access_token'
		return new Promise((resolve, reject) => {
			const client = http2.connect('https://github.com', {
				// ca: cert // not sure if needed yet
			})

			client.on('error', err => reject(err))

			const sp = new URLSearchParams({
				client_id, client_secret, code
			})

			const path = '/login/oauth/access_token'
			const reqPath = path + '?' + sp.toString()
			console.log('requesting from github', reqPath)

			const req = client.request({
				[HTTP2_HEADER_METHOD]: HTTP2_METHOD_POST,
				[HTTP2_HEADER_PATH]: reqPath,
				[HTTP2_HEADER_ACCEPT]: 'application/json'
			})

			req.setEncoding(UTF8_ENCODING)

			req.on('response', (headers, _flags) => {
				console.log('github status', headers[HTTP2_HEADER_STATUS])
				// for (const name in headers) {
				// }
			})

			let data = ''
			req.on('data', chunk => { data += chunk })
			req.on('end', () => {

				client.close()

				const json = JSON.parse(data)

				if(json.error) { reject(json.error); return }

				resolve(json.access_token)
			})
			req.end()
		})
	}

	static async requestEmail(token) {
		return {
			email: 'name@domain.tld',
			avatar: 'https://avatars.githubusercontent.com/u/92058596?v=4'
		}

		const json = await gitFetch('https://api.github.com/user', token)
		console.log({ json })

		const { avatar_url, login, repos_url } = json

		return { email: login, avatar: avatar_url }
	}
}
