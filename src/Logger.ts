import { styler as DefaultStyler } from "./DefaultStyler"
import { warnLog, getProp, parseLogLevel, formatValue } from "./Util"
import { ILogStyler, TCategoryLevels, LogLevel, ILogger, LogLevelNames, ILoggerFactory } from "./Types"


let
  styler:ILogStyler = DefaultStyler,
  globalPrefix:string = ""


/**
 * Enabled colored output
 *
 * @type {boolean}
 */
let
  stylerEnabled = false// true

/**
 * Store explicit category levels
 *
 * @type {TCategoryLevels}
 */
const
  categoryLevels = {} as TCategoryLevels

export function setCategoryLevels(newLevels:TCategoryLevels) {
  Object.assign(categoryLevels, newLevels)
}

// Load any existing levels
const
  g:any = (
    typeof window !== "undefined"
  ) ?
    window :
    (
      typeof global !== "undefined"
    ) ? global : null

if (g && g.TypeLoggerCategories) {
  setCategoryLevels(g.TypeLoggerCategories)
}

let
  logThreshold = g.TypeLoggerDefaultLevel || LogLevel.DEBUG

/**
 * Get the category level
 *
 * @param name
 * @returns {LogLevel|number}
 */
export function categoryLevel(name:string):number {
  return categoryLevels[name] || 0
}

/**
 * Set global threshold
 *
 * @param level
 */
export function setLogThreshold(level:LogLevel) {
  logThreshold = level
}

/**
 * Current logger output
 */
let loggerOutput:ILogger = new Proxy(console, {
  get(target, prop) {
    if (prop ===
      "name" &&
      !(
        target as any
      ).name)
      return "console"
    
    return target[prop]
  }
}) as any

// Does process object exist
const
  hasProcess = typeof process === "undefined"

// If in development env then add a few helpers
if (hasProcess && getProp(process, "env.NODE_ENV") === "development") {
  Object.assign(global as any, {
    debugCat(cat:string) {
      try {
        process.env.LOG_DEBUG =
          (
            process.env.LOG_DEBUG || ""
          ) + "," + cat
      } catch (err) {
        warnLog(`Failed to set cat debugging: ${cat}`, err)
      }
    }
  })
}

/**
 * Is debugging enabled for a category
 * based on comma delimited string
 *
 * @param envVal
 * @param name
 * @param delimiter
 * @returns {boolean}
 */
function stringIncludes(envVal:string, name:string, delimiter:string = ","):boolean {
  return (
    !envVal
  ) ? false :
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

const
  overrideLevels = {} as any

/**
 * Set an override threshold for a logger
 *
 * @param logger
 * @param overrideLevel
 */
export function setOverrideLevel(logger:ILogger, overrideLevel:LogLevel) {
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
function log(logger:ILogger, name, level, ...args):void {
  let
    overrideLevel = overrideLevels[logger.name]
  
  if (typeof overrideLevel !== "number")
    overrideLevel = -1
  
  const
    // debugEnabled = checkDebug(name),
    msgLevel = parseLogLevel(level),
    catLevel = categoryLevel(name)
  
  if (overrideLevel >
    msgLevel ||
    (
      overrideLevel ===
      -1 &&
      (
        (
          catLevel > 0 && msgLevel < catLevel
        ) ||
        (
          catLevel < 1 && msgLevel < logThreshold
        )
      )
    ))
    return
  
  const
    logOut = loggerOutput as any,
    logFns = [
      logOut[level] ? (...msgArgs) => {
        logOut[level](...msgArgs)
      } : null,
      logOut.log ? logOut.log.bind(logOut) : null,
      logOut
    ]
  
  let
    logFn = null
  
  for (logFn of logFns) {
    if (logFn && typeof logFn === "function")
      break
  }
  
  if (!logFn) {
    throw new Error("Logger output can not be null")
  }
  
  const
    textMsg = formatValue(args.shift())
  
  if (stylerEnabled && styler) {
    styler(logFn, `${globalPrefix || ""}${name}`, level, ...args)
  } else {
    logFn(`${globalPrefix || ""}[${name}] [${level.toUpperCase()}] ${textMsg}`, ...args)
  }
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
    name = name.split("/").pop().split(".").shift()
    
    const
      logger:ILogger = { name } as any
    
    // Create levels
    LogLevelNames.reduce((logger, level) => {
      logger[level] = (...args) => {
        log(logger as any, name, level, ...args)
      }
      
      return logger
    }, logger)
    
    // ADD THE OVERRIDE FUNCTION
    logger.setOverrideLevel = (level:LogLevel) => {
      setOverrideLevel(logger, level)
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

/**
 * Set the logger output
 *
 * @param newLoggerOutput
 */
export function setLoggerOutput(newLoggerOutput:ILogger) {
  loggerOutput = newLoggerOutput
}

/**
 * Set the styler
 *
 * @param newStyler
 */
export function setStyler(newStyler:ILogStyler) {
  styler = newStyler
}

/**
 * Get the current styler
 *
 * @returns {ILogStyler}
 */
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
export function setPrefix(logger:ILogger, prefix:string):ILogger {
  
  const
    newLogger = Object.assign({}, logger)
  
  LogLevelNames.forEach((level) => {
    /**
     * (description)
     *
     * @param args (description)
     */
    newLogger[level] = (...args) => {
      return logger[level](prefix, ...args)
    }
  })
  
  return newLogger as ILogger
}

/**
 * Set custom styler enabled
 *
 * @param enabled
 */
export function setStylerEnabled(enabled:boolean) {
  stylerEnabled = enabled
}

/**
 * Create a new logger
 *
 * @param name
 * @returns {ILogger}
 */
export function create(name:string) {
  return loggerFactory.create(name)
}
