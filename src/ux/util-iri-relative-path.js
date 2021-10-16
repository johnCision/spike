export function iriToRelativePath(iri, baseIri) {
	// is there a way to use the URL class to do this? is there a IRI class?
	return iri.replace(baseIri, '')
}
