import { Writable } from 'node:stream';
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    NOTICE = 2,
    WARNING = 3,
    ERROR = 4,
    CRITICAL = 5
}
export declare enum OutputType {
    JSON = 0,
    TEXT = 1
}
export declare class ZeptoLogger {
    private static _instance;
    private _minLevel;
    private _outputType;
    private _destination;
    private _childName;
    constructor(minLevel?: LogLevel, outputType?: OutputType, destination?: Writable);
    static get instance(): ZeptoLogger;
    createChild(childName: string): ZeptoLogger;
    set minLevel(level: LogLevel);
    set outputType(outputType: OutputType);
    set destination(destination: Writable);
    log(logLevel: LogLevel, message: unknown, extra?: object): void;
}
