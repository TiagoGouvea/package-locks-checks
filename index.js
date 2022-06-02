#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const {program} = require('commander');
const {checkMultipleLockFiles, checkUnmatchedYarnLockFile, checkRange} = require("./checkers");

program
    .version(require('./package.json').version)
    .description('Checks the package-lock.json file for http:// links')
    .option('-pm, --packageManager [yarn/npm/pnpm]', 'Project package manager', 'yarn')
    .option('-p, --basePath <path>', 'Base path to load package files')
    .option('-f, --packageFile <file>', 'Full path to package.json file')
    .option('-r, --allowRange <boolean>', 'Allow to have a range (ex: 1 or 1.x or ^1.0.4)  other than specific version (ex: 1.0 or 1.0.4) on package dependencies', false)
    .option('-mlf, --allowMultipleLockFiles <boolean>', 'Allow to have lock files (package-lock.json, yarn.lock, pnpm-lock.lock) at same time', false)
    .option('-uyl, --allowUnmatchedYarnLock <boolean>', 'Allow to have different hashed versions on package.json and yarn.lock file', false)
    .option('-d, --debug <boolean>', 'Enable/disable debugging mode', false)
    .parse(process.argv)

const options = program.opts();

async function doVerify() {
    const exitCodes = [];

    // Normalize params
    if (options.debug) options.debug = options.debug === 'true';
    if (!options.packageManager) options.packageManager = 'yarn';
    if (!options.basePath && options.packageFile) options.basePath = path.dirname(options.packageFile);
    if (!options.basePath) options.basePath = process.cwd(); //path.normalize('./');
    if (!options.packageFile) options.packageFile = path.normalize(options.basePath + path.sep + 'package.json');

    console.log("package-locks-checks > validating package with "+options.packageManager);

    // Show normalized options (when debugging)
    if (options.debug) console.log("options", options);

    // Validate params
    if (!['yarn', 'npm', 'pnpm'].includes(options.packageManager)) {
        console.log("Package Manager must be: yarn, npm or pnpm");
        process.exit(1);
    }
    if (!fs.existsSync(options.basePath)) {
        console.log("Invalid basePath: " + options.basePath);
        process.exit(1);
    }
    if (!fs.existsSync(options.packageFile)) {
        console.log(`package.json not found on basePath: "${options.packageFile}"`)
        process.exit(1);
    }
    // Validate params - packageFile
    if (!fs.existsSync(options.packageFile)) {
        console.log("package.json not found: " + options.packageFile);
        process.exit(1);
    }

    // Validate packages and options

    // Check versions range - allowRange param
    if (options.allowRange === false)
        exitCodes.push(checkRange(options));

    // Check multiple lock files - allowMultipleLockFiles param
    if (options.allowMultipleLockFiles === false) {
        exitCodes.push(checkMultipleLockFiles(options));
    }

    // Check unmatched yarn lock - allowUnmatchedYarnLock param
    if (options.allowUnmatchedYarnLock === false && options.packageManager === 'yarn') {
        const r = await checkUnmatchedYarnLockFile(options);
        exitCodes.push(r);
    }

    const finalExitCode = Math.max(...exitCodes);
    if (finalExitCode == 0) {
        console.log("package-locks-checks > Everything is ok!");
    }
    process.exit(finalExitCode);
}

doVerify();

