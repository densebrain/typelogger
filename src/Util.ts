import { LogLevel } from "./Types";

/**
 * Warn logging message
 *
 * @param msg
 * @param err
 */
export function warnLog(msg:string,err:Error) {
	try {
		console.warn(msg,err)
	} catch (err2) {}
}


/**
 * Parse log level
 *
 * @param level
 * @returns {any}
 */
export function parseLogLevel(level:string) {
	let logLevel:any = LogLevel.DEBUG
	try {
		logLevel = LogLevel[level.toUpperCase() as any]
	} catch (err) {
		warnLog(`Failed to parse log level ${level}`,err)
		logLevel = LogLevel.DEBUG
	}
	
	return logLevel
}

/**
 * Format a message value
 *
 * @param value
 * @returns {string}
 */
export function formatValue(value) {
	const
		valueType = typeof value
	
	return (['number','string','boolean'].indexOf(valueType) > -1) ?
		value : JSON.stringify(value,null,4)
}

/**
 * Get a deep property
 *
 * @param obj
 * @param keyPath
 * @returns {any}
 */
export function getProp(obj,keyPath) {
	if (!obj)
		return null
	
	const
		keyParts = keyPath.split('.'),
		key = keyParts.shift(),
		val = obj[key]
	
	return (keyParts.length) ? getProp(val,keyParts.join('.')) : val
}


