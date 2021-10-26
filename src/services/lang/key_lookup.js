import { workerData, parentPort } from 'worker_threads'

const SP_LANG = 'lang'
const SP_KEYS = 'keys'

async function handleMessage(message, options = {}) {
	const { replyPort, search } = message

	const sp = new URLSearchParams(search)
	if(!sp.has(SP_LANG)) {
		replyPort.postMessage({ error: 'missing lang' })
		return
	}
	if(!sp.has(SP_KEYS)) {
		replyPort.postMessage({ error: 'missing keys' })
		return
	}

	const lang = sp.get(SP_LANG)
	const keys = sp.getAll(SP_KEYS)

	const langStore = {
		en: {
			prev: 'Previous',
			next: 'Next',
			submit: 'Submit',
			reset: 'Reset',

			contacts: 'Contacts',

			driverComments: 'Additional comments for the driver?'
		},
		fr: {
			prev: 'Retourner',
			// next: 'Avance',
			submit: 'Soumettre',
			reset: 'Réinitialiser',

			contacts: 'Contacts',

			toppings: 'Quelles garnitures aimeriez-vous?',
			pieSize: 'Taille de la tarte ?',
			driverComments: 'Instructions pour le conducteur?'
		}
	}

	const keyStore = langStore[lang]
	if(keyStore === undefined) {
		replyPort.postMessage({ error: 'invalid lang' })
		return
	}

	const matches = keys.map(key => ({ [key]: keyStore[key] }))
		.reduce((acc, item) => ({ ...acc, ...item }), { lang })

	replyPort.postMessage(matches)
}

function handleMessageSync(message, options) {
	handleMessage(message, options)
		.then()
		.catch(e => console.warn({ e }))
}

function handleErrorSync(err) {
	console.warn({ err })
}

//
parentPort.on('message', msg => handleMessageSync(msg, workerData))
parentPort.on('error', handleErrorSync)
