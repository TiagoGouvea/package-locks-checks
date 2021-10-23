const spawn = require('child_process').spawn;
const path = require('path');

// afterAll(() => setTimeout(() => process.exit(), 100));

const packageMajorMinorPatch = '__tests__/package-major-minor-patch.json';
const packagePatch = '__tests__/package-patch.json';
const packageOk = '__tests__/package-ok.json';

describe("Verify allowRange param", () => {

    it("should exit 1 having problems - package with version ranges",(done)=>{
        const debug = false;
        try {
            let out = '';
            spawn('node', [path.join(__dirname, '../index.js'),
                '--packageFile', '__tests__/package-range/package.json',
                '--debug', debug
            ], {
                cwd: path.join(__dirname, '../'),
            }).on('close', function (code){
                expect(code).toBe(1);
                expect(out).toContain('Package is NOT OK');
                done();
            }).on('error', function (error){
                if (debug) console.log("error error", error);
                expect(error).toBeNull();
                done(error);
            }).stdout.on('data', function (data) {
                if (debug) console.log(data.toString());
                out += data;
            })
        } catch (err){
            done(err);
        }
    });

    it("should exit 0 having success - package without version ranges",(done)=> {
        const debug = false;
        try {
            let out = '';
            spawn('node', [path.join(__dirname, '../index.js'),
                '--packageFile', '__tests__/package-ok/package.json',
                '--allowUnmatchedYarnLock', true, // skip on this test
                '--debug', debug
            ], {
                cwd: path.join(__dirname, '../'),
            }).on('close', function (code){
                expect(code).toBe(0);
                done();
            }).on('error', function (error){
                if (debug) console.log("error error", error);
                expect(error).toBeNull();
                done(error);
            }).stdout.on('data', function (data) {
                if (debug) console.log(data.toString());
                out += data;
            })
        } catch (err){
            done(err);
        }
    });
});