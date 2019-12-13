
const chalk = require('chalk') as any

let styles = {
	standard: {
		text(str:string) {
			return chalk.white(str)
		}
	},
	debug: {
		level(str) {
			return chalk.green(str)
		},
		name(str) {
			return chalk.white(str)
		}
	},
	info: {
		level(str) {
			return chalk.black.bgBlue.bold(str)
		},
		name(str) {
			return chalk.blue.bold(str)
		}
	},
	warn: {
		level(str) {
			return chalk.black.bgYellow.bold(str)
		},
		name(str) {
			return chalk.yellow.bold(str)
		}
	},
	error: {
		level(str) {
			return chalk.black.bgRed.bold(str)
		},
		name(str) {
			return chalk.red.bold(str)
		}
	}
}


/**
 * Super duper simple logger
 * 
 * @param logFn
 * @param name
 * @param level
 * @param args
 */
export function styler(logFn,name,level,...args) {
	let msg = styles[level].name(`[${name}] `) +
		styles[level].level(`[${level.toUpperCase()}]`)

	logFn(msg,...args)
}