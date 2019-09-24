const events = require('./events/event');
const onConnection = (socket) => {
    socket.on('chennel', events.join(socket, namespace))
    socket.on('exits', events.exits(socket, namespace))
    socket.on('candidate', events.candidate(socket, namespace))
    socket.on('offer', events.offer(socket, namespace))
    socket.on('answer', events.answer(socket, namespace))
    socket.on('close', events.close(socket, namespace))
    socket.on('onmessage', events.onmessage(socket, namespace))

    socket.on('onstart', events.onstart(socket, namespace))
    socket.on('onstream', events.onstream())   
}

exports.createNameSpace = (io) => {    
    namespace = io
        .on('connection', onConnection)
}