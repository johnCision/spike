import { promises as fs } from 'fs'

import { validate } from './util-validator.js'

import { createSpikeInstance } from './ux.spike.instance.js'

const UTF_8 = 'utf-8'

if(process.argv.length <= 2) {
	throw new Error('missing evn configuration json')
}
const envPath = process.argv[process.argv.length - 1]

const [ envSchema, candidateEnv ] = await Promise.all([
	fs.readFile('./src/ux/ux.env.schema.json', UTF_8),
	fs.readFile(envPath, UTF_8)
])

const ux = await validate(candidateEnv, envSchema)
// ux is valid config at this point, load known files

const [ cert, key, pfx ] = await Promise.all([
	fs.readFile(ux.secrets.cert, UTF_8),
	fs.readFile(ux.secrets.key, UTF_8),
	fs.readFile(ux.secrets.pfx) // utf-8 here failed
])

const machineSchema = ''

const services = await Promise.all(ux.services.map(async service => {
	if(service.active === false) { return service }
	if(service?.parameters?.machineIrl === undefined) { return service }
	const machineStr = await fs.readFile(service.parameters.machineIrl)
	const machine = await validate(machineStr, machineSchema)

	return {
		...service,
		machine
	}
}))


// and go!
const _ = await createSpikeInstance({ ...ux, services }, {
	cert, key, pfx, passphrase: ux.secrets.passphrase
})
