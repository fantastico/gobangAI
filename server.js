var cluster = require('cluster');

if (cluster.isMaster) {
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
} else {

    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());

    var AI = require('./js/script');
    var teamname = 'K_test';
    var plays = [];
    var debug = false;

    app.post('/gobang', function (req, res) {
        var data = req.body;
        var head = data.head;
        var body = data.body;
        if (head.type == 0) {
            if (debug) {
                console.log("########################################");
                console.log(new Date());
                console.log(data);
                console.log("****************************************");
            }
            if ("player_white" in body && body.player_white != null) {
                data.body.player_white.name = teamname;
                data.body.player_white.url = "http://120.76.220.214:3000/gobang";
            }
            if ("player_black" in body && body.player_black != null) {
                data.body.player_black.name = teamname;
                data.body.player_black.url = "http://120.76.220.214:3000/gobang";
            }
            data.head.err_msg = "success";
            if (debug) {
                console.log(data);
                console.log("########################################\n\n\n");
            }
            res.send(data);
            return;
        }

        if (head.type == 1) {
            var steps = data.body.steps;
            if (debug) {
                console.log("########################################");
                console.log(new Date());
                console.log(data);
                console.log(steps);
                console.log("****************************************");
            }
            if (!(head.id in plays)) {
                plays.push(head.id);
            }
            var isblack = true;
            if (steps != null) {
                isblack = (steps[steps.length - 1].side != 'b');
            }
            var nextMove = AI.nextMove(steps, isblack);
            data.body.steps = [{
                "side": isblack ? "b" : "w",
                "x": nextMove.u + 1,
                "y": nextMove.v + 1,
                "time": null
            }];
            data.head.err_msg = "success";
            if (debug) {
                console.log(data);
                console.log("---------- steps");
                console.log(data.body.steps);
                console.log("########################################\n\n\n");
            }
            res.send(data);
            return;
        }
        res.send(data);
    });


    app.listen(3000, function () {
        console.log("Started on PORT 3000");
    });

}