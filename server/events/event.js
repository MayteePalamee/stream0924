/**NOTE which ffmpeg */
var shell = require('shelljs');
var ffmpeg = shell.which('ffmpeg');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**#.env */
const dotenv = require('dotenv');
dotenv.config();
if (!ffmpeg) {
    shell.echo('Sorry, this script requires ffmpeg');
    shell.exit(1);
}
/**NOTE  */
const spawn = require('child_process').spawn;
var stream = [], state = [];
const onstart = (socket, namespace) => () => {
    const room = Object.keys(socket.rooms)[1];  
    Object.keys(stream).forEach(function(id) {
        namespace.to(room).emit('onstream', "rtmp : " + process.env.RTMP + id); 
        new StreamHandler(id);
    }); 
} 
var StreamHandler = function(_id){
    var args = [
        '-i','-',
        '-framerate', '30',
        '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency',  // video codec config: low latency, adaptive bitrate
        '-c:a', 'aac', '-ar', '44100', '-b:a', '64k', // audio codec config: sampling frequency (11025, 22050, 44100), bitrate 64 kbits
        '-y', //force to overwrite
        '-use_wallclock_as_timestamps', '1', // used for audio sync
        '-async', '1', // used for audio sync
        //'//-filter_complex', 'aresample=44100', // resample audio to 44100Hz, needed if input is not 44100
        '-strict', 'experimental', 
        '-bufsize', '2000',
        '-f', 'flv', process.env.RTMP + _id
    ];

    stream[_id] = spawn('ffmpeg', args);
    state[_id] = true;
    stream[_id].on('error', function (err) {
        console.log(err);
        state[_id] = false;
        stream[_id].stdin.end();
        stream[_id].kill('SIGINT');
    });

    stream[_id].on('message', function(message){
        console.log(_id + ' : ' + "ffmpeg : " , message)
    })

    stream[_id].on('close', function (code) {
        console.log('ffmpeg exited with code ' + code);
        state[_id]  = state = false;
    });
    
    stream[_id].stderr.on('data', function (data) {
        var tData = data.toString('utf8');
        var a = tData.split('\n');
        console.log(_id + ' : ' +a);
    });
    
    stream[_id].stdout.on('data', function (data) {
        var tLines = data.toString().split('\n');
        var progress = {};
        for (var i = 0; i < tLines.length; i++) {
            var key = tLines[i].split('=');
            if (typeof key[0] != 'undefined' && typeof key[1] != 'undefined') {
                progress[key[0]] = key[1];
            }
        }    
        // The 'progress' variable contains a key value array of the data
        console.log(_id + ' : ' +progress);    
    });
}
util.inherits(StreamHandler, EventEmitter);

function onlive(socket,data){
    if(state[socket.id]){
        stream[socket.id].stdin.write(data);
    }  
}
const onstream = (socket, namespace) => (data) => {   
    onlive(socket,data)
} 

const onremote = (socket, namespace) => (data) => {   
    onlive(socket,data)
} 
/** 
 * @param {*} socket 
 * @param {*} namespace 
 */
const join = (socket, namespace) => (room) => {
    socket.join(room)
    
    const _id = Object.keys(socket.rooms)[1];
    /**NOTE stream */
    stream[socket.id] = null;
    state[socket.id] = false;

    namespace.to(_id).emit('chennel', socket.id + ' : ' + room);
} 
const exits = (socket, namespace) => (room) => {
    namespace.to(room).emit('onmessage', 'user : ' + socket.id + ' exit room.');
    socket.leave(room, () => {      
        console.log("exit room")
    })
}
const offer = (socket, namespace) => (offer) => {
    const room = Object.keys(socket.rooms)[1];
    socket.to(room).emit('offer', offer);
}
const candidate = (socket, namespace) => (candidate) => {
    const room = Object.keys(socket.rooms)[1];
    socket.to(room).emit('candidate', candidate);
}
const answer = (socket, namespace) => (answer) => {
    const room = Object.keys(socket.rooms)[1];
    socket.to(room).emit('answer', answer);
}
const onmessage = (socket, namespace) => (message) => {
    const room = Object.keys(socket.rooms)[1];
    namespace.to(room).emit('onmessage', message);
}
const close = (socket, namespace) => (message) => {
    const room = Object.keys(socket.rooms)[1];
    namespace.to(room).emit('close', message);
}

module.exports = {  join, offer, exits ,candidate,answer,onmessage,close, onstart, onstream, onremote}
