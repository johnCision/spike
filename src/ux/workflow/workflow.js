import { Stately } from './stately.js'

export async function createWorkflowHandler(_storage, _machine) {
	return async message => {
		console.log('Workflow', { message })

		// given a transition event request
		// and a given user state
		// validate and apply the transition effect
		// update user state
		// and return



		return { state: 'questions' }
	}
}
