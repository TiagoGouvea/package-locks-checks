const fs = require("fs");
const semver = require("semver");

function getPackageContent(packageFile) {
    if (fs.existsSync(packageFile)) {
        const filecontent = fs.readFileSync(packageFile, {encoding: 'utf-8'});
        return JSON.parse(filecontent);
    }
}

function checkMultipleLockFiles(options) {
    const lockFiles = [fs.existsSync(options.basePath + 'package-lock.json'), fs.existsSync(options.basePath + 'yarn.lock'), fs.existsSync(options.basePath + 'pnpm-lock.yaml')];
    const multipleExisting = lockFiles.filter(l => l == true).length > 1;
    if (options.debug) console.log("bothExists", multipleExisting);
    if (multipleExisting) {
        console.log(`Multiple package lockers existing at same time is NOT OK.`);
        console.log(`In order to fix this do:`);
        console.log(`- Remove one of that files`);
        console.log(`- Run ${options.packageManager} again to update lock files`);
        return 1; // error
    }

    return 0;
}

function checkUnmatchedYarnLockFile(options) {
    return new Promise((resolve, reject) => {
        try {
            if (options.debug) console.log("basePath", options.basePath);
            if (!fs.existsSync(options.basePath + 'yarn.lock')){
                console.log("yarn.lock not found, cannot check for integrity. You can use '--allowUnmatchedYarnLock true' to skip this verification");
                return resolve(0);
            }
            let out = '';
            let outError = '';
            const close = (code) => {
                if (options.debug) console.log(">> checkUnmatchedLockFile >> close - code: ", code, " - out: ", out, " - outError: ", outError);
                if (out.includes("Folder in sync")) {
                    resolve(0);
                } else if (outError.includes("Couldn't find an integrity file")) {
                    console.log(outError);
                    // console.log("Couldn't find an integrity file - node_modules folder could be not present")
                    resolve(1);
                } else if (outError.includes("Lockfile does not contain pattern")) {
                    console.log("package.json and yarn.lock has unmatched versions")
                    console.log(outError);
                    // console.log("Couldn't find an integrity file - node_modules folder could be not present")
                    resolve(1);
                } else {
                    console.log("Unexpected yarn check integrity (checkUnmatchedLockFile) error:");
                    console.log(">> Code: ", code, " - Error message: ", outError, " Additional yarn message: ", out);
                    resolve(1);
                }
            }

            const spawn = require('child_process').spawn;

            // if (options.debug) console.log("options", options);
            // yarn check --integrity

            const childProcess = spawn(options.packageManager, ['check', '--integrity'], {
                cwd: options.basePath,
            });
            childProcess.on('close', function (code) {
                close(code);
            }).on('exit', function (code) {
                // if (options.debug) console.log(">> exit code", code);
                // if (code != 0)
                //     close(code);
            });
            childProcess.stderr.on('data', (data) => {
                if (options.debug) console.log(">> stderr data", data.toString());
                outError += data;
            });
            childProcess.stdout.on('data', function (data) {
                if (options.debug) console.log(">> data", data.toString());
                out += data;
            });
        } catch (err) {
            console.log(">> catch error", err);
            reject(1);
        }
    })
}

function checkRange(options, content) {
    if (!content)
        content = getPackageContent(options.packageFile);
    // const find = "*";
    if (options.debug) console.log("content", content);

    const dependencies = {...content.dependencies, ...content.devDependencies};
    if (options.debug) console.log("dependencies", dependencies);

    const packages = Object.keys(dependencies);
    if (options.debug) console.log("packages", packages);

    const exists = packages.reduce((result, pkg) => {
        const packageValue = dependencies[pkg];
        const version = semver.valid(packageValue);
        const range = semver.validRange(packageValue);

        if (options.debug) console.log(pkg, packageValue, "- range", range, " - version", version);

        if (!version)
            result.push(`"${pkg}": "${packageValue}"`);
        return result;
    }, []);
    if (options.debug) console.log("exits", exists);

    if (exists.length > 0) {
        console.log(`Package is NOT OK. It includes dependencies with wide version ranges:`)
        exists.map(pkg => {
            console.log(pkg)
        })
        console.log();
        console.log(`In order to fix this do:`);
        console.log(`- Update dependencies on package removing ranges, restricting acceptable version ranges`);
        console.log(`- Run <yarn> again to update lock files`);
        return 1; // error
    }

    // console.log(`Package is OK`);
    return 0; // ok
}

module.exports = {checkRange, checkUnmatchedYarnLockFile, checkMultipleLockFiles}