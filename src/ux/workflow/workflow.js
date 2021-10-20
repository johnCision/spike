import { Stately } from './stately.js'

export async function createWorkflowHandler(machine, options) {
	return async message => {
		console.log('Workflow', { message })

		// given a transition event request
		// and a given user state
		// validate and apply the transition effect
		// update user state
		// and return

		const requestTransition = 'START'
		const userState = 'welcome_user'

		// const effect = Stately.apply(machine, userState, requestTransition)
		// const { state } = effect

		return { state: 'questions' }
	}
}
