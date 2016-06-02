import DefaultStyler from './DefaultStyler'

export interface ILogStyler {
	(logFn,name,level,...args):void
}

let styler:ILogStyler = DefaultStyler

/**
 * Log level values
 */
export enum LogLevel {
	TRACE,
	DEBUG,
	INFO,
	WARN,
	ERROR

}

/**
 * Enabled colored output
 *
 * @type {boolean}
 */
let stylerEnabled = false// true


/**
 * Logger interface
 *
 * @export
 * @interface ILogger
 */
export interface ILogger {
	debug:(...args) => void
	info:(...args) => void
	warn:(...args) => void
	error:(...args) => void
}


/**
 * Create logger instances for output
 *
 * @export
 * @interface ILoggerFactory
 */
export interface ILoggerFactory {
	/**
	 * Return a new logger for the supplied
	 * name/category
	 *
	 * @param {string} name (description)
	 * @returns {ILogger} (description)
	 */
	create(name:string):ILogger
}

let logThreshold = LogLevel.DEBUG

export type CategoryLevels = {[name:string]:LogLevel}

const categoryLevels = {} as CategoryLevels

export function setCategoryLevels(newLevels:CategoryLevels) {
	Object.assign(categoryLevels,newLevels)
}

export function categoryLevel(name:string):number {
	return categoryLevels[name] || 0
}

export function setLogThreshold(level:LogLevel) {
	logThreshold = level
}

/**
 * Current logger output
 */
let loggerOutput:ILogger = console

function parseLogLevel(level:string) {
	let logLevel:any = LogLevel.DEBUG
	try {
		logLevel = LogLevel[level.toUpperCase() as any]
	} catch (err) {
		console.warn(`Failed to parse log level ${level}`,err)
		logLevel = LogLevel.DEBUG
	}

	return logLevel
}

function formatValue(value) {
	const valueType = typeof value
	return (['number','string','boolean'].indexOf(valueType) > -1) ?
		value : JSON.stringify(value,null,4)
}

/**
 * Generic log action
 *
 * @param name
 * @param level
 * @param args
 */
function log(name,level, ...args):void {
	const msgLevel = parseLogLevel(level)
	const catLevel = categoryLevel(name)

	if ((catLevel > 0 && msgLevel < catLevel) || (msgLevel < logThreshold))
		return

	const logOut = loggerOutput as any
	const logFns = [
		logOut[level] ? (...msgArgs) => { logOut[level](...msgArgs) } : null,
		logOut.log ? logOut.log.bind(logOut) : null,
		logOut
	]
	let logFn = null
	for (logFn of logFns) {
		if (logFn && typeof logFn === 'function')
			break
	}

	if (!logFn) {
		throw new Error('Logger output can not be null')
	}

	const textMsg = formatValue(args.shift())

	stylerEnabled && styler ?
		styler(logFn,name,level,...args) :
		//logFn(`[${name}] [${level.toUpperCase()}]`,...args)
		logFn(`[${name}] [${level.toUpperCase()}] ${textMsg}` +
			((args.length === 0) ? '' : args.reduce((outMsg,nextPart) => {
				// if (nextPart === null || typeof nextPath === 'undefined')
				// 	return
				outMsg = (outMsg.length) ? outMsg + ', ' : ''
				return outMsg + formatValue(nextPart)
			}),''))
}

/**
 * Default log factory, uses console
 */
export const DefaultLoggerFactory = {

	/**
	 * Creates a simple logger, parsing
	 * provided category as a simple filename
	 * and using the current output for output
	 *
	 * @param name
	 * @returns {ILogger}
	 */
	create(name:string):ILogger {
		name = name.split('/').pop().split('.').shift()

		/**
		 * (description)
		 *
		 * @param level (description)
		 */
		const logger = {}

		// Create levels
		const levels = ['debug','info','warn','error']
		levels.forEach((level) => {
			/**
			 * (description)
			 *
			 * @param args (description)
			 */
			logger[level] = (...args) => {
				log(name,level,...args)
			}
		})

		return logger as ILogger

	}
}

/**
 * Internal core logger factory
 */
let loggerFactory:ILoggerFactory = DefaultLoggerFactory

/**
 * Change the internal default logger
 *
 * @export
 * @param newLoggerFactory new logger factory
 */
export function setLoggerFactory(newLoggerFactory:ILoggerFactory) {
	loggerFactory = newLoggerFactory
}

export function setLoggerOutput(newLoggerOutput:ILogger) {
	loggerOutput = newLoggerOutput
}

export function setStyler(newStyler:ILogStyler) {
	styler = newStyler
}

export function getStyler() {
	return styler
}

export function setStylerEnabled(enabled:boolean) {
	stylerEnabled = enabled
}

export function create(name:string) {
	return loggerFactory.create(name)
}
