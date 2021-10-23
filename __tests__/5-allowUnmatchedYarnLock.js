const spawn = require('child_process').spawn;
const path = require('path');

describe("Verify allowUnmatchedYarnLock param", () => {

    it("should exit 1 having problems - folder with yarn.lock unmatched with package.json",(done)=>{
        // This test (from now) requires node_modules inside "__tests__/unmatched-fail/" folder
        const debug = false;
        try {
            let out = '';
            spawn('node', [path.join(__dirname, '../index.js'),
                '--basePath', '__tests__/unmatched-fail/',
                '--allowRange', true, // skip check range on files on this test
                '--debug', debug
            ], {
                cwd: path.join(__dirname, '../'),
            }).on('close', function (code){
                expect(code).toBe(1);
                expect(out).toContain('package.json and yarn.lock has unmatched versions');
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
                '--basePath', '__tests__/unmatched-success/',
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