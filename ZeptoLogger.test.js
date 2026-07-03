import test from 'ava';
import { Writable } from 'node:stream';
import { ZeptoLogger, LogLevel, OutputType } from './ZeptoLogger.js';
class CaptureWritable extends Writable {
    chunks = [];
    _write(chunk, _encoding, callback) {
        this.chunks.push(chunk.toString());
        callback();
    }
    getOutput() {
        return this.chunks.join('');
    }
}
test.serial('ZeptoLogger.instance returns the same instance on repeated access', (t) => {
    const instance1 = ZeptoLogger.instance;
    const instance2 = ZeptoLogger.instance;
    t.is(instance1, instance2);
});
test.serial('constructor creates distinct instances', (t) => {
    const instance1 = new ZeptoLogger();
    const instance2 = new ZeptoLogger();
    t.not(instance1, instance2);
});
test('LogLevel enum numeric values are correct', (t) => {
    t.is(LogLevel.DEBUG, 0);
    t.is(LogLevel.INFO, 1);
    t.is(LogLevel.NOTICE, 2);
    t.is(LogLevel.WARNING, 3);
    t.is(LogLevel.ERROR, 4);
    t.is(LogLevel.CRITICAL, 5);
});
test('OutputType enum numeric values are correct', (t) => {
    t.is(OutputType.JSON, 0);
    t.is(OutputType.TEXT, 1);
});
test('Messages below minLevel are suppressed', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.ERROR, OutputType.TEXT, capture);
    logger.log(LogLevel.DEBUG, 'should-not-appear');
    logger.log(LogLevel.INFO, 'should-not-appear');
    logger.log(LogLevel.WARNING, 'should-not-appear');
    t.is(capture.getOutput(), '');
});
test('Messages at minLevel are written', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.WARNING, OutputType.TEXT, capture);
    logger.log(LogLevel.WARNING, 'warning-message');
    t.true(capture.getOutput().includes('warning-message'));
});
test('Changing minLevel at runtime affects filtering', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.ERROR, OutputType.TEXT, capture);
    logger.log(LogLevel.INFO, 'should-not-appear');
    logger.minLevel = LogLevel.INFO;
    logger.log(LogLevel.INFO, 'should-appear');
    const output = capture.getOutput();
    t.false(output.includes('should-not-appear'));
    t.true(output.includes('should-appear'));
});
test('TEXT output contains ISO timestamp, level name, and message', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    logger.log(LogLevel.INFO, 'hello-world');
    const output = capture.getOutput();
    t.true(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(output));
    t.true(output.includes('INFO'));
    t.true(output.includes('hello-world'));
});
test('TEXT child output includes childName', (t) => {
    const capture = new CaptureWritable();
    const parent = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    const child = parent.createChild('myChild');
    child.log(LogLevel.INFO, 'child-log');
    t.true(capture.getOutput().includes('|myChild'));
});
test('TEXT output includes serialized extra when provided', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    logger.log(LogLevel.INFO, 'with-extra', { key: 'value', num: 42 });
    const output = capture.getOutput();
    t.true(output.includes('{"key":"value","num":42}'));
});
test('TEXT NOTICE output includes NOTICE label', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    logger.log(LogLevel.NOTICE, 'notice-message');
    const output = capture.getOutput();
    t.true(output.includes('NOTICE'));
});
test('JSON NOTICE output parses with correct logLevel', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.JSON, capture);
    logger.log(LogLevel.NOTICE, 'notice-json');
    const output = capture.getOutput();
    const parsed = JSON.parse(output);
    t.is(parsed.logLevel, 'NOTICE');
});
test('JSON output parses as valid JSON', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.JSON, capture);
    logger.log(LogLevel.INFO, 'json-test');
    const output = capture.getOutput();
    t.notThrows(() => {
        JSON.parse(output);
    });
});
test('JSON output includes date, logLevel, message', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.JSON, capture);
    logger.log(LogLevel.INFO, 'json-fields');
    const output = capture.getOutput();
    const parsed = JSON.parse(output);
    t.true('string' === typeof parsed.date);
    t.is(parsed.logLevel, 'INFO');
    t.is(parsed.message, 'json-fields');
});
test('JSON output includes extra when provided', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.JSON, capture);
    logger.log(LogLevel.INFO, 'json-extra', { foo: 'bar' });
    const output = capture.getOutput();
    const parsed = JSON.parse(output);
    t.is(parsed.logLevel, 'INFO');
    t.deepEqual(parsed.extra, { foo: 'bar' });
});
test('JSON output handles circular extra object', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.JSON, capture);
    const circular = { name: 'circular' };
    circular.self = circular;
    t.notThrows(() => {
        logger.log(LogLevel.INFO, 'circular-test', circular);
    });
    const output = capture.getOutput();
    const parsed = JSON.parse(output);
    t.is(parsed.message, 'circular-test');
});
test('String messages pass through', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    logger.log(LogLevel.INFO, 'plain-string');
    t.true(capture.getOutput().includes('plain-string'));
});
test('Number messages are logged', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    logger.log(LogLevel.INFO, 42);
    t.true(capture.getOutput().includes('42'));
});
test('Boolean messages become true/false text', (t) => {
    const captureTrue = new CaptureWritable();
    const loggerTrue = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, captureTrue);
    loggerTrue.log(LogLevel.INFO, true);
    t.true(captureTrue.getOutput().includes('true'));
    const captureFalse = new CaptureWritable();
    const loggerFalse = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, captureFalse);
    loggerFalse.log(LogLevel.INFO, false);
    t.true(captureFalse.getOutput().includes('false'));
});
test('Function messages are evaluated lazily when message passes filtering', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    let calls = 0;
    logger.log(LogLevel.DEBUG, () => {
        calls++;
        return 'lazy-value';
    });
    t.is(calls, 1);
    t.true(capture.getOutput().includes('lazy-value'));
});
test('Function messages are not evaluated when filtered out', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.ERROR, OutputType.TEXT, capture);
    let calls = 0;
    logger.log(LogLevel.DEBUG, () => {
        calls++;
        return 'not-called';
    });
    t.is(calls, 0);
    t.is(capture.getOutput(), '');
});
test('Error messages in TEXT output include ErrorName and message', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    const error = new SyntaxError('syntax-issue');
    logger.log(LogLevel.ERROR, error);
    const output = capture.getOutput();
    t.true(output.includes('<SyntaxError>'));
    t.true(output.includes('syntax-issue'));
});
test('Error messages at DEBUG in TEXT output include stack trace', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    const error = new Error('stack-test');
    logger.log(LogLevel.DEBUG, error);
    const output = capture.getOutput();
    const lines = output.split('\n').filter((line) => '' !== line);
    t.true(2 <= lines.length);
    t.true(lines[0].includes('<Error>'));
    t.true(lines[0].includes('stack-test'));
    t.true(lines[1].includes('Error: stack-test'));
});
test('Error messages in JSON output use the stack string', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.JSON, capture);
    const error = new Error('json-stack');
    logger.log(LogLevel.DEBUG, error);
    const output = capture.getOutput();
    const parsed = JSON.parse(output);
    t.is(typeof parsed.message, 'string');
    t.true(parsed.message.startsWith('Error: json-stack'));
});
test('String wrapper objects convert to primitive string', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    logger.log(LogLevel.INFO, new String('wrapper-value'));
    const output = capture.getOutput();
    t.true(output.includes('wrapper-value'));
});
test('null message logs without throwing and uses empty TEXT message', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    t.notThrows(() => {
        logger.log(LogLevel.DEBUG, null);
    });
    const output = capture.getOutput();
    t.false(output.includes('null'));
    t.true(/\] \n$/.test(output));
});
test('Destination setter redirects later writes', (t) => {
    const capture1 = new CaptureWritable();
    const capture2 = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture1);
    logger.log(LogLevel.DEBUG, 'first');
    logger.destination = capture2;
    logger.log(LogLevel.DEBUG, 'second');
    t.true(capture1.getOutput().includes('first'));
    t.false(capture1.getOutput().includes('second'));
    t.true(capture2.getOutput().includes('second'));
});
test('Child loggers inherit parent settings at creation time', (t) => {
    const capture = new CaptureWritable();
    const parent = new ZeptoLogger(LogLevel.WARNING, OutputType.JSON, capture);
    const child = parent.createChild('child-inherit');
    child.log(LogLevel.DEBUG, 'should-not-appear');
    t.is(capture.getOutput(), '');
    child.log(LogLevel.WARNING, 'should-appear');
    const output = capture.getOutput();
    const parsed = JSON.parse(output);
    t.is(parsed.logLevel, 'WARNING');
});
test('Changing outputType at runtime switches output format', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    logger.log(LogLevel.INFO, 'text-message');
    const textOutput = capture.getOutput();
    t.true(textOutput.includes('text-message'));
    const capture2 = new CaptureWritable();
    logger.outputType = OutputType.JSON;
    logger.destination = capture2;
    logger.log(LogLevel.INFO, 'json-message');
    const jsonOutput = capture2.getOutput();
    const parsed = JSON.parse(jsonOutput);
    t.is(parsed.logLevel, 'INFO');
    t.is(parsed.message, 'json-message');
});
test('TEXT output logs stringified objects', (t) => {
    const capture = new CaptureWritable();
    const logger = new ZeptoLogger(LogLevel.DEBUG, OutputType.TEXT, capture);
    logger.log(LogLevel.INFO, { key: 'value' });
    const output = capture.getOutput();
    t.true(output.includes('{"key":"value"}'));
});
test('Changing child minLevel does not change parent minLevel', (t) => {
    const capture = new CaptureWritable();
    const parent = new ZeptoLogger(LogLevel.ERROR, OutputType.TEXT, capture);
    const child = parent.createChild('independent');
    child.minLevel = LogLevel.DEBUG;
    parent.log(LogLevel.DEBUG, 'parent-debug');
    t.is(capture.getOutput(), '');
    child.log(LogLevel.DEBUG, 'child-debug');
    t.true(capture.getOutput().includes('child-debug'));
});
