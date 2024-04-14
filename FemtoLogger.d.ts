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
export declare function GetLogger(): FemtoLogger;
export declare function CreateLogger(): FemtoLogger;
declare class FemtoLogger {
    private _minLevel;
    private _outputType;
    private _destination;
    private _childName;
    constructor(minLevel?: LogLevel, outputType?: OutputType, destination?: NodeJS.WriteStream, childName?: string);
    CreateChild(childName: string): FemtoLogger;
    set minLevel(level: LogLevel);
    set outputType(outputType: OutputType);
    set destination(destination: NodeJS.WriteStream);
    log(logLevel: LogLevel, message: any, extra?: object): void;
}
export {};
