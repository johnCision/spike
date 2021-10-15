
export class Stately {
	static async transition(machine, state, transition) {
		const options = machine[state]
		if(options === undefined) { throw new Error('unknown state') }
		const action = options[transition]
		if(action === undefined) { throw new Error('unknown transition') }

		const { target } = action

		return {
			target
		}
	}
}
