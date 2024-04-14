const { LogLevel, OutputType, GetLogger, CreateLogger } = require( './ZeptoLogger.js' );
const { createWriteStream } = require( 'fs' );
const messageError = new SyntaxError( 'This is an ERROR test' );
const messageDebug = 'This is an DEBUG test';
const messageInfo = 'This is an INFO test';

const logger = CreateLogger();
logger.minLevel = LogLevel.INFO;
logger.log( LogLevel.INFO, messageInfo, { 'date': new Date() } );
logger.log( LogLevel.DEBUG, messageDebug );
logger.log( LogLevel.ERROR, messageError );
let destination = createWriteStream( 'test-text.log', { flags: 'w' } );
logger.destination = destination;

const loggerChild = logger.CreateChild( 'LOGDEBUG' );
loggerChild.minLevel = LogLevel.DEBUG;
loggerChild.log( LogLevel.INFO, messageInfo );
loggerChild.log( LogLevel.DEBUG, messageError );

logger.log( LogLevel.INFO, messageInfo, { 'date': new Date() } );
logger.log( LogLevel.DEBUG, messageDebug );
logger.log( LogLevel.ERROR, messageError );

destination = createWriteStream( 'test-json.log', { flags: 'w' } );
logger.destination = destination;
logger.minLevel = LogLevel.DEBUG;
logger.outputType = OutputType.JSON;
logger.log( LogLevel.INFO, messageInfo, { 'date': new Date() } );
logger.log( LogLevel.DEBUG, messageDebug );
logger.log( LogLevel.ERROR, messageError );
