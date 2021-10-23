const spawn = require('child_process').spawn;
const path = require('path');

describe("Verify basePath param", () => {

    it("should exit 1 having problems - folder don't exists",(done)=>{
        const debug = false;
        try {
            let out = '';
            spawn('node', [path.join(__dirname, '../index.js'),
                '--basePath', '/not_exits/',
                '--debug', debug
            ], {
                cwd: path.join(__dirname, '../'),
            }).on('close', function (code){
                expect(code).toBe(1);
                expect(out).toContain('Invalid basePath');
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
    it("should exit 1 having problems - folder exists but have not a package file",(done)=>{
        const debug = false;
        try {
            let out = '';
            spawn('node', [path.join(__dirname, '../index.js'),
                '--basePath', '__tests__/emptyFolder',
                '--debug', debug
            ], {
                cwd: path.join(__dirname, '../'),
            }).on('close', function (code){
                expect(code).toBe(1);
                expect(out).toContain('package.json not found');
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
    it("should exit 0 having success - folder exists",(done)=> {
        const debug = false;
        try {
            let out = '';
            spawn('node', [path.join(__dirname, '../index.js'),
                '--basePath', '__tests__/multipleLockFiles-success/',
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