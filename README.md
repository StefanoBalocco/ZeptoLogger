# ZeptoLogger
Because Micro-, Mini-, Pico-, Nano- and Femto- was already used.

ZeptoLogger is a simple and very small logging utility for Node.js applications. It provides functionality to log messages with different log levels and output formats.

v2 is ESM-only.

## Installation

You can install ZeptoLogger via npm or pnpm:

```bash
npm install zeptologger
```

```bash
pnpm add zeptologger
```

## Usage
```javascript
import { ZeptoLogger, LogLevel, OutputType } from 'zeptologger';

// Get the singleton logger instance
const logger = ZeptoLogger.instance;

// Set minimum log level
logger.minLevel = LogLevel.INFO;

// Change output type
logger.outputType = OutputType.JSON;

// Change destination
logger.destination = process.stdout;

// Log a message
logger.log( LogLevel.INFO, 'This is an information message' );
```

Create a custom logger:

```javascript
const logger = new ZeptoLogger( LogLevel.DEBUG, OutputType.JSON );
```

Create a child logger:

```javascript
const child = logger.createChild( 'api' );
```

## API

### ZeptoLogger.instance

- Static getter that returns the singleton instance of the logger.

### new ZeptoLogger( minLevel?, outputType?, destination? )

- Creates a new logger instance with optional minimum log level, output type, and destination.

### ZeptoLogger class

#### Methods

- `log( level, message, extra )`: Logs a message with the specified log level. Optionally, an extra object can be provided for additional data.
- `createChild( label )`: Creates a child logger instance with the specified label.

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

## License

BSD-3-Clause
