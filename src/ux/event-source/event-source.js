export async function createEventSource(_options) {
	return (stream, headers, _flags) => {
		// no external router yet
		if(headers[':path'] !== '/sse/') { return }

		stream.respond({
			':status': 200,
			'content-type': 'text/event-stream'
		})
	}
}
