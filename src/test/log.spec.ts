import 'jest'
import * as TypeLogger from "../index"

const Log = TypeLogger

test('#logger',() => {
	let log = null

	beforeEach(() => {
		log = Log.create("test")
	})

	it('#creates',() => {

		expect(log).not.toBeNull()
		log.info('test output')
	})
	
	// it('#styled',() => {
	// 	const stylerSpy = sinon.spy(TypeLogger.getStyler())
	// 	TypeLogger.setStyler(stylerSpy)
	// 	log.info('testing for spy styling')
	//
	// 	expect(stylerSpy.calledOnce).to.be.true
	// })

	// it('#not-styled',() => {
	// 	const stylerSpy = sinon.spy(TypeLogger.getStyler())
	// 	TypeLogger.setStyler(stylerSpy)
	// 	TypeLogger.setStylerEnabled(false)
	// 	log.info('testing for spy styling')
	//
	// 	expect(stylerSpy.calledOnce).to.be.false
	// })
})