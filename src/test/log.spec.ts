require('source-map-support').install()
import 'expectations'
import * as Log from "../log"

describe('#logger',() => {
	it('#creates',() => {
		const logger = Log.create(__filename)
		expect(logger).not.toBeNull()
		logger.info('test output')
	})
})