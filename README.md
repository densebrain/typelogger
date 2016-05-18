typelogger
---


## Overview
Super simply log wrapper for any framework or the console.
Strongly typed with thresholds

## Install
Pretty simple

```bash
npm i --save typelogger
```

## Use
It couldn't be much easier

```typescript
import * as Log from "typelogger"

const logger = Log.create(__filename)
logger.info('What up!!!')

// To override the output functions
Log.setLoggerOutput(console)

// To swap out the create factory entirely
Log.setLoggerFactory({
	create(name:string) {

		// This is a crap example - checkout the ILogger def
		// for the right way
		console.log(`Creating custom logger with custom factory for: ${name}`)
		return console as Log.ILogger
	}
})

// Or just add a cute styler
// Log.setStyler(Log.ILogStyler) - we use a simple chalk styler by default

```