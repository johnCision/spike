import { workerData, parentPort } from 'worker_threads'

async function handleMessage(_message, options = {}) {

	// GET /questionnair/<name>
	//
	const questions = [
		{
			urn: 'urn:question/🍕',
			type: 'pill',
			question: 'what toppings would you like on your pizza?',

			pillLookupIrn: 'irn:spike/ux/workflow/questions/pillMatch?question=urn:question/🍕',
			validateIrn: 'irn:spike/ux/workflow/question/validate?question=urn:question/🍕'
		},
		{
			type: 'choice',
			question: 'what size of a pie shall we cook for you?',
			choices: [
				{ name: 'single slice' },
				{ name: 'normal pie' },
				{ name: 'party size' }
			]
		},
		{
			question: 'ABC'
		}
	]

	return questions
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
