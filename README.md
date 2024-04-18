# ZeptoLogger
Because Micro-, Mini-, Pico-, Nano- and Femto- was already used.

ZeptoLogger is a simple and very small logging utility for Node.js applications. It provides functionality to log messages with different log levels and output formats.

## Installation

You can install ZeptoLogger via npm:

```bash
npm install zeptologger
```

## Usage
```javascript
"use strict";

const { CreateLogger, GetLogger, LogLevel, OutputType } = require("zeptologger");

// Get a logger instance
const logger = GetLogger();

// Set minimum log level
logger.minLevel = LogLevel.INFO;

// Change output type
logger.outputType = OutputType.JSON;

// Change destination
logger.destination = process.stdout;

// Log a message
logger.log(LogLevel.INFO, "This is an information message");
```

## API

### GetLogger()

- Function to get the singleton instance of the logger.

### CreateLogger()

- Function to create a new instance of the logger.

### ZeptoLogger class

#### Methods

- `log(level, message, extra)`: Logs a message with the specified log level. Optionally, an extra object can be provided for additional data.
- `CreateChild(label)`: Creates a child logger instance with the specified label.

#### Properties

- `minLevel`: Sets the minimum log level.
- `outputType`: Sets the output type.
- `destination`: Sets the destination for log output.

### LogLevel

An enum that lists all the available levels.

- `DEBUG`: Debug level messages.
- `INFO`: Information level messages.
- `NOTICE`: Notice level messages.
- `WARNING`: Warning level messages.
- `ERROR`: Error level messages.
- `CRITICAL`: Critical level messages.

### OutputType

An enum that lists the output types.

- `JSON`: Output log messages in JSON format.
- `TEXT`: Output log messages in plain text format.
