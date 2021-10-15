
class Storage {
	static async add(store, id, doc) { }
	static async get(store, id) { }
}

export async function createWorkflowHandler(storage, machine) {
	return async (method, pathname, search) => {
		return { error: 'workflow not impl.' }
	}
}
