const process = require('child-process-promise');
const FileSystem = require('fs');
const path = require('path');

const settings = JSON.parse(FileSystem.readFileSync(path.resolve(__dirname, "../sonar.json"), "UTF8"));

console.log("Connecting with Sonar...");
var scanner = process.spawn("sonar-scanner", settings, {shell: true});

scanner.childProcess.stdout.on('data', (data) => console.log("-> " + data));
scanner.childProcess.stderr.on('data', (data) => console.log("-> " + data));

scanner.then(() => {
    console.log("-> Finished!");
})
.catch((err) => console.log(err.stack));
