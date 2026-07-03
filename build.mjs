import * as ts from 'typescript';

const targetsAllowed = new Set( [ 'library', 'tests' ] );

function compile( configPath ) {
	const configFile = ts.readConfigFile( configPath, ts.sys.readFile );
	if( !configFile.error ) {
		const parsedConfig = ts.parseJsonConfigFileContent( configFile.config, ts.sys, '.', {}, configPath );
		if( 0 === parsedConfig.errors.length ) {
			const program = ts.createProgram( parsedConfig.fileNames, parsedConfig.options );
			const emitResult = program.emit();
			const allDiagnostics = ts.getPreEmitDiagnostics( program ).concat( emitResult.diagnostics );
			const errors = allDiagnostics.filter( ( d ) => ts.DiagnosticCategory.Error === d.category );
			if( 0 < errors.length ) {
				for( const error of errors ) {
					if( error.file ) {
						const { line, character } = error.file.getLineAndCharacterOfPosition( error.start );
						console.error( `${ error.file.fileName }(${ line + 1 },${ character + 1 }): ${ error.messageText }` );
					} else {
						console.error( error.messageText );
					}
				}
				throw new Error( `TypeScript compilation failed for ${ configPath }` );
			}
		} else {
			for( const error of parsedConfig.errors ) {
				console.error( `tsconfig error: ${ error.messageText }` );
			}
			throw new Error( `Invalid tsconfig for ${ configPath }` );
		}
	} else {
		throw new Error( `Failed to read ${ configPath }: ${ configFile.error.messageText }` );
	}
}

const targetsArgs = new Set( process.argv.slice( 2 ) );
const targets = targetsAllowed.intersection( targetsArgs );
const targetsInvalid = targetsArgs.difference( targetsAllowed );

if( targets.size && !targetsInvalid.size ) {
	if( targets.has( 'library' ) ) {
		console.log( 'Building library...' );
		compile( 'tsconfig.json' );
		console.log( 'Library built successfully.' );
	}

	if( targets.has( 'tests' ) ) {
		console.log( 'Building tests...' );
		compile( 'tsconfig.tests.json' );
		console.log( 'Tests built successfully.' );
	}
} else {
	if( targetsInvalid.size ) {
		console.log( 'Invalid targets: ' + [ ...targetsInvalid.values() ].join( ', ' ) );
	}
	console.log( 'Usage: node build.mjs <target> ...' );
	console.log( 'Targets: library, tests' );
	process.exitCode = 1;
}
