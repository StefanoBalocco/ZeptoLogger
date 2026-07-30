import { Writable } from 'node:stream';
import process from 'node:process';
import stringify from 'safe-stable-stringify';

type Undefinedable<T> = T | undefined;

export enum LogLevel {
	DEBUG,
	INFO,
	NOTICE,
	WARNING,
	ERROR,
	CRITICAL
}

export enum OutputType {
	JSON,
	TEXT
}

export class ZeptoLogger {
	private static _instance: Undefinedable<ZeptoLogger>;
	private _minLevel: LogLevel;
	private _outputType: OutputType;
	private _destination: Writable;
	private _childName: Undefinedable<string> = undefined;

	public constructor( minLevel: LogLevel = LogLevel.INFO, outputType: OutputType = OutputType.TEXT, destination: Writable = process.stdout ) {
		this._minLevel = minLevel;
		this._outputType = outputType;
		this._destination = destination;
	}

	public static get instance(): ZeptoLogger {
		return ( ZeptoLogger._instance ??= new ZeptoLogger() );
	}

	public createChild( childName: string ): ZeptoLogger {
		const child: ZeptoLogger = new ZeptoLogger( this._minLevel, this._outputType, this._destination );
		child._childName = childName;
		return child;
	}

	public set minLevel( level: LogLevel ) {
		this._minLevel = level;
	}

	public set outputType( outputType: OutputType ) {
		this._outputType = outputType;
	}

	public set destination( destination: Writable ) {
		this._destination = destination;
	}

	public log( logLevel: LogLevel, message: unknown, extra?: object ): void {
		if( this._minLevel <= logLevel ) {
			const output: { date: string; logLevel: string; message?: unknown; extra?: object; } = {
				date: ( new Date() ).toISOString(),
				logLevel: LogLevel[ logLevel ],
				message: ''
			};
			if( extra ) {
				output.extra = extra;
			}

			switch( typeof message ) {
				case 'string':
				case 'number': {
					output.message = message;
					break;
				}
				case 'boolean': {
					output.message = ( message ? 'true' : 'false' );
					break;
				}
				case 'function': {
					output.message = ( message as () => unknown )();
					break;
				}
				case 'object': {
					if( message ) {
						output.message = message;
					}
					break;
				}
			}

			switch( this._outputType ) {
				case OutputType.JSON: {
					if( output.message instanceof Error ) {
						output.message = output.message.stack;
					}
					this._destination.write( stringify( output ) + '\n' );
					break;
				}
				case OutputType.TEXT: {
					if( 'object' === typeof output.message ) {
						if( output.message instanceof Error ) {
							output.message = '<' + output.message.name + '> ' + output.message.message;
						} else if( !( output.message instanceof String ) ) {
							output.message = stringify( output.message );
						}
					}
					this._destination.write(
						'[' + output.date + '|' +
						output.logLevel +
						( this._childName ? '|' + this._childName : '' ) +
						( extra ? '|' + stringify( extra ) : '' ) +
						'] ' + output.message + '\n'
					);
					if( ( LogLevel.DEBUG === logLevel ) && ( message instanceof Error ) ) {
						this._destination.write( message.stack + '\n' );
					}
					break;
				}
			}
		}
	}
}
