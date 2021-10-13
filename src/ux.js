
import { promises as fs } from 'fs'

import { createLocalServer } from './http/http.js'
import { createRouter } from './http/route.js'
import { handleGithubAuth } from './auth/github.js'
import { createWorkflowHandler } from './workflow/workflow.js'

const rarityUserStore = {
	'email': { state: 'anon' }
}

const rarityState = {
	'anon': {
		'LOGIN': { target: 'welcome_user' }
	},
	'welcome_user': {
		'LOGOUT': { target: 'anon' },
		'START': { target: 'questions' }
	},
	'questions': {
		'RESET': { target: 'welcome_user' },
		'NEXT': {},
		'PREV': {},
	},
	'home': {
		'LOGOUT': { target: 'anon' },
		'RESET': { target: 'welcome_user' },
		'START': { target: 'questions'}
	}
}

const handleRarityApplication = createWorkflowHandler({
	store: rarityUserStore,
	machine: rarityState
})

const handlerRainbowDashApplication = createWorkflowHandler()

const router = await createRouter({
	'/github_token': handleGithubAuth,
	'/rarity': handleRarityApplication,
	'/rainbowdash': handlerRainbowDashApplication,
	'/data': undefined
})

// read in all the stuff for https
// should add AbortController to these calls
const cert = await fs.readFile('./secrets/localhost-cert.pem', 'utf-8')
const key = await fs.readFile('./secrets/localhost-privkey.pem', 'utf-8')
const pfx = await fs.readFile('./secrets/output.pfx', ) // utf8 here failed

const server = await createLocalServer({
	cert, key, pfx,  passphrase: 'asdf'
})
server.on('error', e => console.log({ e }))
server.on('request', router)

server.listen(8080, () => console.log('service up'))