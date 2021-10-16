import { promises as fs } from 'fs'

import { validate } from './util-validator.js'
import { iriToRelativePath } from './util-iri-relative-path.js'

import { createHTTP2Server } from './http/http.js'
import { createHTTPStaticServer } from './static-http/static-http.js'
import { createRouter } from './http/route.js'

import { createServiceInstance } from './ux.service.instance.js'
import { createWorkflowInstance } from './ux.workflow.instance.js'

const UTF_8 = 'utf-8'

if(process.argv.length <= 2) {
	throw new Error('missing evn configuration json')
}

const commandLineArg = process.argv[process.argv.length - 1]

const envSchema = await fs.readFile('./src/ux/ux.env.schema.json', UTF_8)

async function createSpikeInstance(instanceEnv) {
	const canidateUx = await fs.readFile(instanceEnv, UTF_8)
	const ux = await validate(canidateUx, envSchema)

	// read in all the stuff for https
	// should add AbortController to these calls
	const cert = await fs.readFile(ux.secrets.cert, UTF_8)
	const key = await fs.readFile(ux.secrets.key, UTF_8)
	const pfx = await fs.readFile(ux.secrets.pfx) // utf-8 here failed

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

	const server = await createHTTP2Server({
		cert, key, pfx, passphrase: ux.secrets.passphrase
	})
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

// and go!
const _unused = await createSpikeInstance(commandLineArg)
