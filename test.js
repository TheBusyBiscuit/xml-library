const lib = require('./src/lib.js');
const FileSystem = require('fs');

FileSystem.readdir("tests", function(err, files) {
    for (var i in files) {
        require(files[i])(lib);
    }
});
