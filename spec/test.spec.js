
import { describe } from 'mocha'
import { expect } from 'chai'

describe('a suite', () => {
	describe('a test', () => {
		it('should be gt', () => {
			expect(5).to.be.greaterThan(4)
		})
	})
})
