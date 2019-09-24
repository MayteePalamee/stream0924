/**NOTE which ffmpeg */
var shell = require('shelljs');
var ffmpeg = shell.which('ffmpeg');
/**#.env */
const dotenv = require('dotenv');
dotenv.config();

if (!ffmpeg) {
    shell.echo('Sorry, this script requires ffmpeg');
    shell.exit(1);
}
/**NOTE  */
const spawn = require('child_process').spawn;

/**
 * 
 * @param {*} blob 
 * @param {*} socket 
 * @param {*} namespace 
 */
const onstream = (socket, namespace) => (data) => {
    var args = [
        '-i','-',
        '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency',  // video codec config: low latency, adaptive bitrate
        '-c:a', 'aac', '-ar', '44100', '-b:a', '64k', // audio codec config: sampling frequency (11025, 22050, 44100), bitrate 64 kbits
        '-y', //force to overwrite
        '-use_wallclock_as_timestamps', '1', // used for audio sync
        '-async', '1', // used for audio sync
        //'-filter_complex', 'aresample=44100', // resample audio to 44100Hz, needed if input is not 44100
        //'-strict', 'experimental', 
        '-bufsize', '1000',
        '-f', 'flv', process.env.RTMP+ '/12345'
    ];

    ffmpeg = spawn('ffmpeg', args);
    ffmpeg.stdin.write(data);

    const room = Object.keys(socket.rooms)[1];
    namespace.to(room).emit('onstream', "stream run with : "+ process.env.RTMP+ '/'+ socket.id);

    ffmpeg.on('error', function (err) {
        console.log(err);
        ffmpeg.stdin.end();
        ffmpeg.kill('SIGINT');
    });
    
    ffmpeg.on('close', function (code) {
        console.log('ffmpeg exited with code ' + code);
    });
    
    ffmpeg.stderr.on('data', function (data) {
        var tData = data.toString('utf8');
        var a = tData.split('\n');
        console.log(a);
    });
    
    ffmpeg.stdout.on('data', function (data) {

        var tLines = data.toString().split('\n');
        var progress = {};
        for (var i = 0; i < tLines.length; i++) {
            var key = tLines[i].split('=');
            if (typeof key[0] != 'undefined' && typeof key[1] != 'undefined') {
                progress[key[0]] = key[1];
            }
        }    
        // The 'progress' variable contains a key value array of the data
        console.log(progress);
    
    });    
} 

/** 
 * @param {*} socket 
 * @param {*} namespace 
 */
const join = (socket, namespace) => (room) => {
    socket.join(room)
    namespace.to(room).emit('chennel', socket.id + ' : ' + room);
} 
const exits = (socket, namespace) => (room) => {
    socket.leave(room, () => {
        socket.to(room).emit('onmessage', 'user : ' + socket.id + ' exit room.');
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
module.exports = {  join, offer, exits ,candidate,answer,onmessage,close, onstream}
