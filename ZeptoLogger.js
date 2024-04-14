"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLogger = exports.GetLogger = exports.OutputType = exports.LogLevel = void 0;
const process_1 = __importDefault(require("process"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["NOTICE"] = 2] = "NOTICE";
    LogLevel[LogLevel["WARNING"] = 3] = "WARNING";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["CRITICAL"] = 5] = "CRITICAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var OutputType;
(function (OutputType) {
    OutputType[OutputType["JSON"] = 0] = "JSON";
    OutputType[OutputType["TEXT"] = 1] = "TEXT";
})(OutputType || (exports.OutputType = OutputType = {}));
let _instance;
function GetLogger() {
    if (!_instance) {
        _instance = CreateLogger();
    }
    return _instance;
}
exports.GetLogger = GetLogger;
function CreateLogger() {
    return new ZeptoLogger();
}
exports.CreateLogger = CreateLogger;
class ZeptoLogger {
    constructor(minLevel = LogLevel.INFO, outputType = OutputType.TEXT, destination = process_1.default.stdout, childName) {
        this._minLevel = minLevel;
        this._outputType = outputType;
        this._destination = destination;
        this._childName = childName;
    }
    CreateChild(childName) {
        return new ZeptoLogger(this._minLevel, this._outputType, this._destination, childName);
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
        if (logLevel >= this._minLevel) {
            const output = {
                date: new Date(),
                logLevel: LogLevel[logLevel],
                message: message
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
                    output.message = 'false';
                    if (message) {
                        output.message = 'true';
                    }
                    break;
                }
                case 'function': {
                    output.message = message();
                    break;
                }
                case 'object': {
                    if (message instanceof Error) {
                        output.message = message;
                    }
                    else if (message instanceof String) {
                        output.message = message.toString();
                    }
                    break;
                }
            }
            switch (this._outputType) {
                case OutputType.JSON: {
                    if (output.message instanceof Error) {
                        output.message = output.message.stack;
                    }
                    this._destination.write(JSON.stringify(output) + "\n");
                    break;
                }
                case OutputType.TEXT: {
                    if ('object' === typeof output.message) {
                        if (output.message instanceof Error) {
                            output.message = "<" + output.message.name + "> " + output.message.message;
                        }
                        else {
                            output.message = output.message.toString();
                        }
                    }
                    this._destination.write('[' + output.date.toISOString() + '|' +
                        output.logLevel +
                        (this._childName ? '|' + this._childName : '') +
                        (extra ? '|' + JSON.stringify(extra) : '') +
                        '] ' + output.message + "\n");
                    if ((LogLevel.DEBUG === logLevel) && (message instanceof Error)) {
                        this._destination.write(message.stack + "\n");
                    }
                    break;
                }
            }
        }
    }
}
