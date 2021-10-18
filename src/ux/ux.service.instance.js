import { Worker } from 'worker_threads'

import { iriToRelativePath } from './util-iri-relative-path.js'

export async function createServiceInstance(service, baseIrn) {
	const route = iriToRelativePath(service.irn, baseIrn)

	const worker = new Worker(service.irl, {
		workerData: service.parameters
	})

	const port = worker

	return { route, port }
}
