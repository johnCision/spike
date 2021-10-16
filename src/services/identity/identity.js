export async function createIdentityHandler(_options) {
	return async function handleIdentity(_method, _pathname, _search) {
		return JSON.stringify({ error: 'nothing here yet' })
	}
}
