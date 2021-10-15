import { workerData, parentPort  } from 'worker_threads'
import * as http2 from 'http2'

const {
	HTTP2_HEADER_PATH,
	HTTP2_HEADER_STATUS,
	HTTP2_METHOD_POST,
	HTTP2_METHOD_GET,
	HTTP2_HEADER_METHOD,
	HTTP2_HEADER_ACCEPT,

	SSL_OP_NO_TLSv1,
	SSL_OP_NO_TLSv1_1,

} = http2.constants;


async function request_token(code, client_id, client_secret, cert) {

	// 'https://github.com/login/oauth/access_token'
	return new Promise((resolve, reject) => {
		const client = http2.connect('https://github.com', {
			// ca: cert // not sure if needed yet
		});

		client.on('error', (err) => reject(err));

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
		});

		req.setEncoding('utf8')

		req.on('response', (headers, flags) => {
			console.log('github status', headers[HTTP2_HEADER_STATUS])
			for (const name in headers) {
			}
		})

		let data = ''
		req.on('data', (chunk) => { data += chunk; })
		req.on('end', () => {

			client.close()

			const json = JSON.parse(data)

			if(json.error) { reject(json.error); return }

			resolve(json.access_token)
		})
		req.end()
	})
}

function handleMessageSync(message) {
	handleMessage(message)
		.then()
		.catch(e => console.warn({ e }))
}

async function handleMessage(message) {
	const { method, pathname, search } = message

	const sp = new URLSearchParams(search)
	if(!sp.has('code')) {
		throw new Error('no code')
	}

	const code = sp.get('code')
	const token = await request_token(code, client_id, client_secret, cert)
	return { token }
}

function handleErrorSync(err) {
	console.warn({ err })
}

//
const { client_id, client_secret, cert } = workerData
parentPort.on('message', handleMessageSync)
parentPort.on('error', handleErrorSync)

