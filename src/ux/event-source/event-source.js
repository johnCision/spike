

export async function createEventSource(options) {
	return (stream, headers, flags) => {
		// no external router yet
		if (headers[':path'] !== '/sse/') { return }

		stream.respond({
			':status': 200,
			'content-type': 'text/event-stream'
		})


	}
}