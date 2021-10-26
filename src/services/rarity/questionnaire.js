import { workerData, parentPort } from 'worker_threads'

async function sleepy(ms) {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), ms)
	})
}

async function handleMessage(message, options = {}) {

	const { replyPort } = message

	const questions = [
		{
			irn: 'irn:question/🍕',
			type: 'pill',
			lang: 'en',
			questionKey: 'toppings',
			question: 'what toppings would you like on your pizza?',

			pillLookupIrn: 'irn:spike/ux/workflow/questions/pillMatch?question=urn:question/🍕',
			validateIrn: 'irn:spike/ux/workflow/question/validate?question=urn:question/🍕'
		},
		{
			irn: 'irn:rarity/orderPizza/question/toppings',
			type: 'choice',
			lang: 'en',
			questionKey: 'pieSize',
			question: 'what size of a pie shall we cook for you?',
			choices: [
				{ name: 'single slice' },
				{ name: 'normal pie' },
				{ name: 'party size' }
			]
		},
		{
			irn: 'irn:rarity/orderPizza/question/comments',
			type: 'text',
			lang: 'en',
			questionKey: 'driverComments',
			question: 'comment for the driver?',
			maxLength: 100
		},
		{
			irn: 'irn:rarity/orderPizza/question/comments2',
			type: 'text',
			lang: 'en',
			questionKey: 'other',
			question: 'other comments??',
			maxLength: 100
		}
	]

	//await sleepy(1000 * 0.5)

	replyPort.postMessage(questions)
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
