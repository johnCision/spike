//
export async function createWorkflowHandler(_storage, _machine) {
	return async _message => {
		return { state: 'questions' }
	}
}
