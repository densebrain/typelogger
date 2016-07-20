
import * as sinonGlobal from 'sinon'
import * as chaiGlobal from 'chai'

declare global {
	var sinon:sinonGlobal.SinonStatic
	var Assertion:chaiGlobal.AssertionStatic;
	var expect:typeof chaiGlobal.expect;
	var assert:typeof chaiGlobal.assert;
	var config:any

}

const g = global as any
g.config = chaiGlobal.config
g.assert = chaiGlobal.assert
g.Assertion = chaiGlobal.Assertion
g.expect = chaiGlobal.expect
g.sinon = sinonGlobal


export {

}