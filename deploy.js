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
        var commandList = [];
        var overallSuccess = null;
        for (var i = 0; i < array.length; i++) {
            var command = array[i];
            var shellResult = shell.exec(command);
            if (shellResult !== null) {
                if (shellResult.code !== 0) {
                    var output =  {command: command, success: false, response: shellResult.stderr};
                    commandList[i] = output;
                    res.status(400);
                    overallSuccess = false;
                    break;
                } else {
                    var output =  {command: command, success: true, response: shellResult.stdout};
                    commandList[i] = output;
                    res.status(200);
                    overallSuccess = true;
                }
            }
        }
        var response = {};
        response.overallSuccess = overallSuccess;
        response.commandList = commandList;

        res.send(response);
    });
}

app.listen(8080, function () {
    console.log('NodeDeploy listening on port 8080!');
});