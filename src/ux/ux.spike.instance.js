import { iriToRelativePath } from './util-iri-relative-path.js'

import { createHTTP2Server } from './http/http.js'
import { createHTTPStaticServer } from './static-http/static-http.js'
import { createRouter } from './http/route.js'

import { createServiceInstance } from './ux.service.instance.js'
import { createWorkflowInstance } from './ux.workflow.instance.js'

export async function createSpikeInstance(ux, secrets) {
	// read in all the stuff for https
	// should add AbortController to these calls

	const futureWorkflows = ux.workflows
		.filter(workflow => workflow.active !== false)
		.map(workflow => createWorkflowInstance(workflow, ux.irn))

	const futureServices = ux.services
		.filter(service => service.active !== false)
		.map(service => createServiceInstance(service, ux.irn))

	const routesList = await Promise.all([
		...futureWorkflows,
		...futureServices
	])
	const routes = routesList
		.reduce((accumulator, binding) => {
			const { route, port } = binding
			return {
				...accumulator,
				[route]: port
			}
		}, {})

	const router = await createRouter({ ...routes })

	const server = await createHTTP2Server(secrets)
	server.on('error', e => console.log({ e }))
	server.on('request', router)
	// server.on('stream', eventSource)

	server.listen(ux.port, () => console.log('service up'))

	const staticRoutes = ux.statics
		.map(s => ({
			route: iriToRelativePath(s.irn, ux.baseIrn),
			rootIrl: s.irl
		}))
		.reduce((accumulator, binding) => {
			const { route, rootIrl } = binding
			return {
				...accumulator,
				[route]: rootIrl
			}
		}, { })

	const staticServer = await createHTTPStaticServer(staticRoutes)

	staticServer.listen(ux.staticPort, () => console.log('web up'))

	return true
}