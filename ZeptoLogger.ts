import process from 'process';

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

let _instance : ZeptoLogger;
export function GetLogger() : ZeptoLogger {
	if( !_instance ) {
		_instance = CreateLogger();
	}
	return _instance;
}

export function CreateLogger(): ZeptoLogger {
	return new ZeptoLogger();
}

class ZeptoLogger {

	private _minLevel: LogLevel;
	private _outputType: OutputType;
	private _destination: NodeJS.WriteStream;
	private _childName: string;

	constructor( minLevel: LogLevel = LogLevel.INFO, outputType: OutputType = OutputType.TEXT, destination: NodeJS.WriteStream = process.stdout, childName?: string ) {
		this._minLevel = minLevel;
		this._outputType = outputType;
		this._destination = destination;
		this._childName = childName;
	}

	public CreateChild( childName: string ): ZeptoLogger {
		return new ZeptoLogger( this._minLevel, this._outputType, this._destination, childName );
	}

	public set minLevel( level: LogLevel ) {
		this._minLevel = level;
	}

	public set outputType( outputType: OutputType ) {
		this._outputType = outputType;
	}

	public set destination( destination: NodeJS.WriteStream ) {
		this._destination = destination;
	}

	public log( logLevel: LogLevel, message: any, extra?: object ): void {
		if( logLevel >= this._minLevel ) {
			const output: { date: Date, logLevel: string, message: any, extra?: object } = {
				date: new Date(),
				logLevel: LogLevel[ logLevel ],
				message: message
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
					output.message = 'false';
					if( message ) {
						output.message = 'true';
					}
					break;
				}
				case 'function': {
					output.message = message();
					break;
				}
				case 'object': {
					if( message instanceof Error ) {
						output.message = message;
					} else if( message instanceof String ) {
						output.message = message.toString();
					}
					break;
				}
			}
			switch( this._outputType ) {
				case OutputType.JSON: {
					if( output.message instanceof Error ) {
						output.message = output.message.stack;
					}
					this._destination.write( JSON.stringify( output ) + "\n" );
					break;
				}
				case OutputType.TEXT: {
					if( 'object' === typeof output.message ) {
						if( output.message instanceof Error ) {
							output.message = "<" + output.message.name + "> " + output.message.message;
						} else {
							output.message = output.message.toString();
						}
					}
					this._destination.write(
						'[' + output.date.toISOString() + '|' +
						output.logLevel +
						( this._childName ? '|' + this._childName : '' ) +
						( extra ? '|' + JSON.stringify( extra ) : '' ) +
						'] ' + output.message + "\n"
					);
					if( ( LogLevel.DEBUG === logLevel ) && ( message instanceof Error ) ) {
						this._destination.write( message.stack + "\n" );
					}
					break;
				}
			}
		}
	}
}
