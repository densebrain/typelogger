/**
 * All log functions
 */
import * as Log from './TypeLogger'

/**
 * The default styler with chalk
 */
import DefaultStyler from './DefaultStyler'

/**
 * Export all functions from ./log
 */
export * from './TypeLogger'

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
