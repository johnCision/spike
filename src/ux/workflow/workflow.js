//
export async function createWorkflowHandler(storage, machine) {
	return async message => {
		return { state: 'questions' }
	}
}
