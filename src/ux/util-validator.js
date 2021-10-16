export async function validate(jsonString, _schemaString) {
	// uh, look. their is not built in way to validate json
	// there are many good libraries out there, and a production
	// env would take advantage of that good work ...
	// but for now .. ya
	return JSON.parse(jsonString)
}
