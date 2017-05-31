var express = require('express');
var shell = require('shelljs');
var app = express();
var fs = require('fs');

const secret = 'mykey';
const script = 'yourscript.sh'

app.get('/', function (req, res) {
    if (secret !== req.query.secret) {
        res.status(400);
        res.send("GET - WRONG SECRET");
        return;
    }

    return runCommand(script, res);
});

function runCommand(script, res) {
    fs.readFile(script, function (err, data) {
        if (err) throw err;
        var array = data.toString().split("\n");
        var output = '{ "commandList" : [';
        for (var i = 0; i < array.length; i++) {
            var command = array[i];
            var shellResult = shell.exec(command);
            if (shellResult !== null) {
                if (shellResult.code !== 0) {
                    output += '{';
                    output += '\t"command": "' + command + '",';
                    output += '\t"success": "' + false + '",';
                    output += '\t"return": "' + shellResult.stderr + '"';
                    output += '}';
                    res.status(400);
                    break;
                } else {
                    output += '{';
                    output += '\t"command": "' + command + '",';
                    output += '\t"success": "' + true + '",';
                    output += '\t"return": "' + shellResult.stdout + '"';
                    if (i === array.length - 1) {
                        output += '}';
                    } else {
                        output += '},';
                    }
                    res.status(200);
                }
            }
        }
        output += ']}';
        res.send(output);
    });
}

app.listen(8080, function () {
    console.log('NodeDeploy listening on port 8080!');
});