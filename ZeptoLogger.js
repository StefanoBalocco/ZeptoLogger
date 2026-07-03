import process from 'node:process';
import stringify from 'safe-stable-stringify';
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["NOTICE"] = 2] = "NOTICE";
    LogLevel[LogLevel["WARNING"] = 3] = "WARNING";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["CRITICAL"] = 5] = "CRITICAL";
})(LogLevel || (LogLevel = {}));
export var OutputType;
(function (OutputType) {
    OutputType[OutputType["JSON"] = 0] = "JSON";
    OutputType[OutputType["TEXT"] = 1] = "TEXT";
})(OutputType || (OutputType = {}));
export class ZeptoLogger {
    static _instance;
    _minLevel;
    _outputType;
    _destination;
    _childName = undefined;
    constructor(minLevel = LogLevel.INFO, outputType = OutputType.TEXT, destination = process.stdout) {
        this._minLevel = minLevel;
        this._outputType = outputType;
        this._destination = destination;
    }
    static get instance() {
        return (ZeptoLogger._instance ??= new ZeptoLogger());
    }
    createChild(childName) {
        const child = new ZeptoLogger(this._minLevel, this._outputType, this._destination);
        child._childName = childName;
        return child;
    }
    set minLevel(level) {
        this._minLevel = level;
    }
    set outputType(outputType) {
        this._outputType = outputType;
    }
    set destination(destination) {
        this._destination = destination;
    }
    log(logLevel, message, extra) {
        if (this._minLevel <= logLevel) {
            const output = {
                date: (new Date()).toISOString(),
                logLevel: LogLevel[logLevel],
                message: ''
            };
            if (extra) {
                output.extra = extra;
            }
            switch (typeof message) {
                case 'string':
                case 'number': {
                    output.message = message;
                    break;
                }
                case 'boolean': {
                    output.message = (message ? 'true' : 'false');
                    break;
                }
                case 'function': {
                    output.message = message();
                    break;
                }
                case 'object': {
                    if (message) {
                        output.message = message;
                    }
                    break;
                }
            }
            switch (this._outputType) {
                case OutputType.JSON: {
                    if (output.message instanceof Error) {
                        output.message = output.message.stack;
                    }
                    this._destination.write(stringify(output) + '\n');
                    break;
                }
                case OutputType.TEXT: {
                    if ('object' === typeof output.message) {
                        if (output.message instanceof Error) {
                            output.message = '<' + output.message.name + '> ' + output.message.message;
                        }
                        else if (!(output.message instanceof String)) {
                            output.message = stringify(output.message);
                        }
                    }
                    this._destination.write('[' + output.date + '|' +
                        output.logLevel +
                        (this._childName ? '|' + this._childName : '') +
                        (extra ? '|' + stringify(extra) : '') +
                        '] ' + output.message + '\n');
                    if ((LogLevel.DEBUG === logLevel) && (message instanceof Error)) {
                        this._destination.write(message.stack + '\n');
                    }
                    break;
                }
            }
        }
    }
}
