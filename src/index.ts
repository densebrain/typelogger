/**
 * All log functions
 */
import * as Log from './log'

/**
 * The default styler with chalk
 */
import DefaultStyler from './DefaultStyler'

/**
 * Export all functions from ./log
 */
export * from './log'

/**
 * Shortcut to Log.create
 *
 * @type {function(string): ILogger}
 */
export const getLogger = Log.create

/**
 * Export the default styler
 */
export { DefaultStyler }

/**
 * By default export Log manager
 */
export default Log
