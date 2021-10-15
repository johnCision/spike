
import { promises as fs } from 'fs'
import { Worker, MessageChannel } from 'worker_threads'

import { validate } from './validator.js'

import { createLocalServer } from './http/http.js'
import { createRouter } from './http/route.js'
import { createWorkflowHandler } from './workflow/workflow.js'

const instanceEnv = './src/ux.env.json'

const envSchema = await fs.readFile('./src/ux/ux.env.schema.json', 'utf-8')

function routeFromIrn(irn, baseIrn) {
	return irn.replace(baseIrn, '')
}

async function createServiceInstance(service, baseIrn) {
	const route = routeFromIrn(service.irn, baseIrn)
	const worker = new Worker(service.irl, {
		workerData: service.parameters
	})

	const port = worker

	return { route, port }
}

async function createWorkflowInstance(workflow, baseIrn) {
	const route = routeFromIrn(workflow.irn, baseIrn)
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

async function createSpikeInstance(instanceEnv) {
	const canidateUx = await fs.readFile(instanceEnv, 'utf-8')
	const ux = await validate(canidateUx, envSchema)

	// read in all the stuff for https
	// should add AbortController to these calls
	const cert = await fs.readFile(ux.secrets.cert, 'utf-8')
	const key = await fs.readFile(ux.secrets.key, 'utf-8')
	const pfx = await fs.readFile(ux.secrets.pfx, ) // utf8 here failed

	const workflows = await Promise.all(ux.workflows
		.filter(workflow => workflow.active !== false)
		.map(async workflow => await createWorkflowInstance(workflow, ux.irn)))

	const services = await Promise.all(ux.services
		.filter(service => service.active !== false)
		.map(async service => await createServiceInstance(service, ux.irn)))

	const routes = [ ...workflows, ...services ]
		.reduce((accumulator, binding) => {
			const { route, port } = binding
			return {
				...accumulator,
				[route]: port
			}
		}, {})

	const router = await createRouter({ ...routes })

	const server = await createLocalServer({
		cert, key, pfx,  passphrase: ux.secrets.passphrase
	})
	server.on('error', e => console.log({ e }))
	server.on('request', router)
	//server.on('stream', eventSource)

	server.listen(ux.port, () => console.log('service up'))
}

const spike = await createSpikeInstance(instanceEnv)
