
export async function createIdentityHandler(options) {
	return async function handleIdentity(method, pathname, search) {
		return JSON.stringify({ error: 'nothing here yet' })
	}
}