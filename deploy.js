var express = require('express');
var shell = require('shelljs');
var app = express();
var fs = require('fs');
var https = require('https');

const secret = 'mykey';
const script = 'myscript.sh'

/*
 In secureMode NodeDeploy is listening on port 8443 with HTTPS, otherwise on 8080 with HTTP
 For secureMode is a server.crt and server.key named ssl certificate required
 */
const secureMode = true;


var bodyParser = require('body-parser')
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    if (secret !== req.query.secret) {
        res.status(403);
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

app.post('/', function (req, res) {
    if (secret !== req.body.secret) {
        res.status(403);

        var response = {"error": "WRONG SECRET"};
        res.send(response)
        return;
    }

    return runCommand(script, res);
});

if(secureMode === true){
    var privateKey  = fs.readFileSync('server.key', 'utf8');
    var certificate = fs.readFileSync('server.crt', 'utf8');

    var httpsServer = https.createServer({key: privateKey, cert: certificate}, app);

    httpsServer.listen(8443, function () {
        console.log('NodeDeploy listening on port 8443!');
    })
}else {
    app.listen(8080, function () {
        console.log('NodeDeploy listening on port 8080!');
    });
}