import * as http2 from 'http2'

const {
	SSL_OP_NO_TLSv1,
	SSL_OP_NO_TLSv1_1
} = http2.constants


export async function createHTTP2Server(options) {
	const { key, cert, pfx, passphrase } = options

	return http2.createSecureServer({
		key,
		cert,
		allowHTTP1: false,
		secureOptions: SSL_OP_NO_TLSv1 | SSL_OP_NO_TLSv1_1,
		//pfx,
		passphrase
	})
}
