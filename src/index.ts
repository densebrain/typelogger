/**
 * All log functions
 */
import * as Log from './Logger'

/**
 * Export all functions from ./log
 */
export * from './Logger'

/**
 * Export all required types
 */
export * from "./Types"

/**
 * The default styler with chalk
 */
export {styler as DefaultStyler} from './DefaultStyler'


/**
 * Shortcut to Log.create
 *
 * @type {function(string): ILogger}
 */
export const getLogger = Log.create


/**
 * By default export Log manager
 */
export default Log
