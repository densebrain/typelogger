
import DefaultStyler from './DefaultStyler'


declare global {
	let TypeLoggerCategories:any
}


export interface ILogStyler {
	(logFn,name,level,...args):void
}

let styler:ILogStyler = DefaultStyler

let globalPrefix:string = ""

/**
 * Log level names
 *
 * @type {(string|string|string|string)[]}
 */
const LogLevelNames = ['debug','info','warn','error']

/**
 * Log level values
 */
export enum LogLevel {
	TRACE = 1,
	DEBUG = 2,
	INFO = 3,
	WARN = 4,
	ERROR = 5
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
	name:string
	debug:(...args) => void
	info:(...args) => void
	warn:(...args) => void
	error:(...args) => void
	
	setOverrideLevel:(level:LogLevel) => void
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


export type CategoryLevels = {[name:string]:LogLevel}

const categoryLevels = {} as CategoryLevels

export function setCategoryLevels(newLevels:CategoryLevels) {
	Object.assign(categoryLevels,newLevels)
}

// Load any existing levels
const g:any = (typeof window !== 'undefined') ? window : (typeof global !== 'undefined') ? global : null
if (g && g.TypeLoggerCategories) {
	setCategoryLevels(g.TypeLoggerCategories)
}

let logThreshold = g.TypeLoggerDefaultLevel || LogLevel.DEBUG


export function categoryLevel(name:string):number {
	return categoryLevels[name] || 0
}

export function setLogThreshold(level:LogLevel) {
	logThreshold = level
}

/**
 * Current logger output
 */
let loggerOutput:ILogger = new Proxy(console,{
	get(target,prop) {
		if (prop === 'name' && !(target as any).name)
			return 'console'
		
		return target[prop]
	}
}) as any

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

function getProp(obj,keyPath) {
	if (!obj)
		return null

	const keyParts = keyPath.split('.')
	const key = keyParts.shift()

	const val = obj[key]

	return (keyParts.length) ? getProp(val,keyParts.join('.')) : val
}


// Does process object exist
const hasProcess = typeof process === 'undefined'

// If in development env then add a few helpers
if (hasProcess && getProp(process,'env.NODE_ENV') === 'development') {
	Object.assign(global as any, {
		debugCat(cat:string) {
			process.env.LOG_DEBUG = (process.env.LOG_DEBUG || '') + ',' + cat
		}
	})
}

/**
 * Is debuging enabled for a category
 * based on comma delimited string
 *
 * @param envVal
 * @param name
 * @param delimiter
 * @returns {boolean}
 */
function stringIncludes(envVal:string,name:string,delimiter:string = ','):boolean {
	return (!envVal) ? false :
		envVal
			.split(delimiter)
			.map(val => val.toLowerCase())
			.includes(name.toLowerCase())
}

// /**
//  * Check if a category has debugging
//  *
//  * @param name
//  * @returns {boolean}
//  */
// function checkDebug(name:string):boolean {
// 	if (!hasProcess)
// 		return false
//
// 	const envDEBUG = getProp(process,'env.DEBUG'),
// 		envLOG_DEBUG = getProp(process,'env.LOG_DEBUG') || ''
//
//
// 	return stringIncludes(envDEBUG,name) || stringIncludes(envLOG_DEBUG,name)
// }

const overrideLevels = {} as any

export function setOverrideLevel(logger:ILogger,overrideLevel:LogLevel) {
	overrideLevels[logger.name] = overrideLevel
}

/**
 * Generic log action
 *
 * @param logger
 * @param name
 * @param level
 * @param args
 */
function log(logger:ILogger,name,level, ...args):void {
	let
		overrideLevel = overrideLevels[logger.name]
	
	if (typeof overrideLevel !== 'number')
		overrideLevel = -1
		
	const
		// debugEnabled = checkDebug(name),
		msgLevel = parseLogLevel(level),
		catLevel = categoryLevel(name)

	if (overrideLevel > msgLevel || (overrideLevel === -1 && ((catLevel > 0 && msgLevel < catLevel) || (catLevel < 1 && msgLevel < logThreshold))))
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

	const
		textMsg = formatValue(args.shift())

	stylerEnabled && styler ?
		styler(logFn,`${globalPrefix || ""}${name}`,level,...args) :
		logFn(`${globalPrefix || ""}[${name}] [${level.toUpperCase()}] ${textMsg}`,...args)
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
		
		const
			logger:ILogger = {name} as any
			
		// Create levels
		LogLevelNames.reduce((logger,level) => {
			logger[level] = (...args) => {
				log(logger as any,name,level,...args)
			}
			
			return logger
		},logger)
		
		// ADD THE OVERRIDE FUNCTION
		logger.setOverrideLevel = (level:LogLevel) => {
			setOverrideLevel(logger,level)
		}
	
		
		return logger

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

/**
 * Global prefix for all loggers
 *
 * @param prefix
 */
export function setPrefixGlobal(prefix:string) {
	globalPrefix = prefix
}

/**
 * Wrap a logger and prepend all log calls
 *
 * @param logger
 * @param prefix
 */
export function setPrefix(logger:ILogger,prefix:string):ILogger {
	
	const
		newLogger = Object.assign({},logger)
	
	LogLevelNames.forEach((level) => {
		/**
		 * (description)
		 *
		 * @param args (description)
		 */
		newLogger[level] = (...args) => {
			return logger[level](prefix,...args)
		}
	})
	
	return newLogger as ILogger
}

export function setStylerEnabled(enabled:boolean) {
	stylerEnabled = enabled
}

export function create(name:string) {
	return loggerFactory.create(name)
}
