/// <reference types="node" />
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
export declare function GetLogger(): ZeptoLogger;
export declare function CreateLogger(): ZeptoLogger;
declare class ZeptoLogger {
    private _minLevel;
    private _outputType;
    private _destination;
    private _childName;
    constructor(minLevel?: LogLevel, outputType?: OutputType, destination?: NodeJS.WriteStream, childName?: string);
    CreateChild(childName: string): ZeptoLogger;
    set minLevel(level: LogLevel);
    set outputType(outputType: OutputType);
    set destination(destination: NodeJS.WriteStream);
    log(logLevel: LogLevel, message: any, extra?: object): void;
}
export {};
