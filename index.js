// TODO
// 1) Read only recently inserted line when file changes
// 2) Have python script read constants.json instead of constants.py
const PORT = 8000
const FILE_NAME = "machineReadable.txt";
const CONSTANTS_FILE_NAME = "constants.json";

var express = require('express');
var app = express();
var fs = require('fs');
var dns = require('dns');
var lastSeen = {};
var macs_to_users = {}

function log(msg) {
    console.log(msg + "\t" + (new Date()));
}

// Check we are running as non-priviledged user
if(process.env.USER != "noded") {
    console.log("Please run as nonpriviledged user noded!!!");
    return;
}

// Root endpoint
app.get('/', function (req, res) {
    log("/");
    res.send('If you don\'t belong here... GO AWAY!!');
});

// who's home endpoint
app.get('/whoshome', function(req, res) {
    log("/whoshome");
    fs.readFile('whoshome.html', 'utf-8', function(err, data) {
        if(err) throw err;
        res.send(data);
    });
});

app.get('/whoshome/data', function(req, res) {
    updateLastSeenFromFile(function() {
        var ret = "";
        var sortable = [];
        for(user in lastSeen) {
            sortable.push([lastSeen[user], user]);
        }
        sortable.sort(function(a, b){return b[0]-a[0]});
        ret = []
        for(i in sortable) {
            var time = sortable[i][0];
            var user = sortable[i][1];
            if(user == "Gateway" || user == "Playstation" ) continue;
            ret.push({'date': time, 'user': user});
        }
        res.send(ret);
    });
});
app.use('/livecams', function(req, res) {
    log("/livecams");
    fs.readFile('livecams.html', 'utf-8',  function(err, data) {
        if(err) {
            throw err;
        }
        res.send(data);
    });
});

// Start server
app.listen(PORT, function () {
    console.log('Started on port ' + PORT);
});

// Populates initial lastSeen dictionary
fs.readFile(CONSTANTS_FILE_NAME, 'utf8', function(err, data) {
    if(err) throw err;
    macs_to_users = JSON.parse(data);
});

function updateLastSeenFromFile(callback) {
    fs.readFile(FILE_NAME, 'utf8', function(err, data) {
        if(err) throw err;
        lines = data.split("\n");
        for(i in lines) {
            var line = lines[i];
            var time = line.split(".")[0]; 
            var temp = line.split("\t")[1];
            if(typeof time == 'undefined' || typeof temp == 'undefined') {
                continue;
            }
            // Refactor to not use slice
            temp = temp.slice(1,-1);
            var macs = temp.split(",");
            for(i in macs) {
                macs[i] = macs[i].replace(/^\s+|\s+$/g, '')
                macs[i] = macs[i].slice(1, -1);
            }
            for(i in macs) {
                var user = macs_to_users[macs[i]];
                if(typeof user == 'undefined') {
                    //console.log(macs[i]);
                    continue;
                }
                if(user in lastSeen) {
                    if(lastSeen[user] < time) {
                        lastSeen[user] = time;
                    }
                }else {
                    lastSeen[user] = time;
                }
            }
        }
        //console.log("File read");
        if(typeof callback != 'undefined') {
            callback();
        }
    });
}
