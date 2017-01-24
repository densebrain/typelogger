

declare global {
	let TypeLoggerCategories:any
}



export interface ILogStyler {
	(logFn,name,level,...args):void
}

/**
 * Log level names
 *
 * @type {(string|string|string|string)[]}
 */
export const LogLevelNames = ['debug','info','warn','error']

export type TCategoryLevels = {[name:string]:LogLevel}

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
