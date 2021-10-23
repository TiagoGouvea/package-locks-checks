const spawn = require('child_process').spawn;
const path = require('path');

// afterAll(() => setTimeout(() => process.exit(), 100));

const packageMajorMinorPatch = '__tests__/package-major-minor-patch.json';
const packagePatch = '__tests__/package-patch.json';
const packageOk = '__tests__/package-ok.json';

describe("Verify allowMultipleLockFiles param", () => {

    it("should exit 1 having problems - folder with yarn.lock and package-lock.json",(done)=>{
        const debug = false;
        try {
            let out = '';
            spawn('node', [path.join(__dirname, '../index.js'),
                '--basePath', '__tests__/multipleLockFiles-fail/',
                '--allowRange', true, // skip check range on files on this test
                '--debug', debug
            ], {
                cwd: path.join(__dirname, '../'),
            }).on('close', function (code){
                expect(code).toBe(1);
                expect(out).toContain('package-lock.json and yarn.lock files existing at same time');
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

    it("should exit 0 having success - folder with just yarn.lock",(done)=> {
        const debug = false;
        try {
            let out = '';
            spawn('node', [path.join(__dirname, '../index.js'),
                '--basePath', '__tests__/multipleLockFiles-success/',
                '--allowRange', true, // skip check range on files on this test
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