import { MessageChannel } from 'worker_threads'

import { createWorkflowHandler } from './workflow/workflow.js'

import { iriToRelativePath } from './util-iri-relative-path.js'

export async function createWorkflowInstance(workflow, baseIrn) {
	const route = iriToRelativePath(workflow.irn, baseIrn)
	const handler = await createWorkflowHandler(workflow.parameters)
	const channel = new MessageChannel()

	channel.port2.on('message', msg => {
		const { replyPort } = msg

		// in sync method, use promise api
		handler()
			.then(result => replyPort.postMessage(result))
			.catch(e => console.warn('workflow reply message handler error', { e }))
	})
	channel.port2.on('error', e => console.warn({ e }))

	const port = channel.port1
	return { route, port }
}
