var aedes = require('aedes')()
var server = require('net').createServer(aedes.handle)
var httpServer = require('http').createServer()
var ws = require('websocket-stream')
var mqPort = 1883
var wsPort = 8888

server.listen(mqPort, () => console.log('mqtt listening'))
ws.createServer({
    server: httpServer
},aedes.handle)

httpServer.listen(wsPort,()=> console.log('ws listening'))

aedes.on('client',
    (client) => {
        if(client){
            console.log(client.id)
        }
    }
)

aedes.on('subscribe',
    (subscriptions,client) => {
        if(client){
            console.log(client.id)
            console.log(subscriptions)
        }
    }
)

aedes.on('publish', 
    (packet,client) => {
        if(client){
            console.log(client.id)
            console.log(packet.topic)
            console.log(packet.payload)
        }
    }
)

