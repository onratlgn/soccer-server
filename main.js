var aedes = require('aedes')()
var mongo = require('./mongo')
var server = require('net').createServer(aedes.handle)
var httpServer = require('http').createServer()
var ws = require('websocket-stream')
var mqPort  = process.env.mqPort || 1883
var wsPort  = process.env.wsPort || 8888
var webPort = process.env.PORT   || 8080


const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(webPort, () => console.log('Example app listening on port '+ webPort))


server.listen(mqPort, () => console.log('mqtt listening'))
ws.createServer({
    server: httpServer
}, aedes.handle)

httpServer.listen(wsPort, () => console.log('ws listening'))

aedes.on('client',
    (client) => {
        if (client) {
            console.log(client.id);
            mongo.devOn(client.id);
        }
    }
)

aedes.on('clientDisconnect',
    (client) => {
        if (client) {
            console.log(client.id);
            mongo.devOff(client.id);
        }
    }
)

aedes.on('subscribe',
    (subscriptions, client) => {
        if (client) {
            console.log(client.id)
            console.log(subscriptions)
        }
    }
)

aedes.on('publish',
    (packet, client) => {
        if (client) {
            var top = packet.topic.split("/");
            if (top[1] == "data") {
                var pL = {};
                var temp = JSON.parse((packet.payload).toString());
                pL["devID"] = top[0];
                pL["gameID"] = temp["gameID"];
                pL["step"] = temp["step"];
                pL["type"] = temp["type"];
                pL["data"] = temp["data"];
                mongo.save("soccer", "data", pL);
            }
            else if (top[1] == "game") {
                var pL = {};
                var temp = JSON.parse((packet.payload).toString());
                pL["from"] = client.id;
                pL["devID"] = top[0];
                pL["data"] = temp["data"]
                mongo.save("soccer", "commands", pL);
            }
        }
        if (client) {
            var pL = {}
            pL["client"] = client.id;
            pL["topic"] = packet.topic;
            if (packet.payload[0] == 0x7b) {
                pL["payload"] = JSON.parse((packet.payload).toString());
            } else {
                pL["payload"] = (packet.payload).toString();
            }
            mongo.save("soccer", "communication", pL);
        }
    }
)


setInterval(() => console.log(Object.keys(aedes.clients)), 10000);


/*
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";

function updateDevStatus(){

    MongoClient.connect(url,function(err,db){
        if(err) throw err;

        var coll = db.db("communication").collection("users")

        coll.updateMany(
            {},
            {$set : {"devices.$[elem].status" : true}},
            {
                arrayFilters: [{"elem.devID" : { $in : Object.keys(aedes.clients)}}],
                upsert: true,
            }
        )
        coll.updateMany(
            {},
            {$set : {"devices.$[elem].status" : false}},
            {
                arrayFilters: [{"elem.devID" : { $nin : Object.keys(aedes.clients)}}],
                upsert: true,
            }
        )
    })
}
*/
