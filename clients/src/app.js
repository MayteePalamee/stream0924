var $ = require('jquery');
const uuidv4 = require('uuid/v4');
const io = require('socket.io-client')('http://localhost:9000', {
    autoConnect: false
});
/**NOTE remote view */
const remote = document.getElementById("remote");
const local = document.getElementById("local");
var mediaLocal = null;
/**
 * ------------------
 * RTCPeerConnection 
 * ------------------
 */
const configuration = {
    iceServers: [
        { url: 'stun:stun.l.google.com:19302' }, 
        // {
        //     urls: "turn:203.151.236.74:80",
        //     username: "ccute",
        //     credential: "ccute01"
        // }
    ],
    mandatory: {
        OfferToReceiveAudio: true
    }
}

/** TODO  create connect ICE server */
var newPeer = () => {
    var pc = new RTCPeerConnection(configuration);
    pc.ondatachannel = e => {
        e.channel.onclose = stop;
    }
    pc.onaddstream = e => {
        remote.srcObject = e.stream;
    }
    pc.oniceconnectionstatechange = function(event) {
        if (pc.iceConnectionState === "failed" ||
            pc.iceConnectionState === "disconnected" ||
            pc.iceConnectionState === "closed") {
          // Handle the failure
          console.log("oniceconnectionstatechange : " , pc.iceConnectionState)
        }
    };
    pc.onconnectionstatechange = function(event) {
        switch(pc.connectionState) {
          case "connected":
            // The connection has become fully connected
            console.log("onconnectionstatechange is connected: " , pc.connectionState)
            break;
          case "disconnected":
          case "failed":
            // One or more transports has terminated unexpectedly or in an error
            console.log("onconnectionstatechange is failed: " , pc.connectionState)
            break;
          case "closed":
            // The connection has been closed
            console.log("onconnectionstatechange is closed: " , pc.connectionState)
            break;
        }
    }
    /* NOTE onicecandidate is called when we receive an ICE candidate, and we send it to our server.*/
    pc.onicecandidate = event => {
        if (event.candidate) {
            io.emit('candidate', event.candidate);
        }
    }
    pc.addEventListener("signalingstatechange", ev => {
        switch(pc.signalingState) {
          case "stable":
            console.log("ICE negotiation complete");
            break;
        }
      }, false);
    /*NOTE let the "negotiationneeded" event trigger offer generation */
    pc.onnegotiationneeded = async () => {
        try {
        await pc.setLocalDescription(await pc.createOffer());
            /* TODO send the offer to the other peer */
            io.emit('offer', pc.localDescription);
        } catch (err) {
            console.error(err);
        }
    };
    return pc;
};

var pc = newPeer();
/* NOTE once remote track media arrives, show it in remote video element */
pc.ontrack = (event) => {
    if (remote.srcObject) return;
    remote.srcObject = event.streams[0];
};

var start = e =>
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        local.srcObject = stream;
        mediaLocal = stream;

        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = event => {
            const blob = event.data;
            /**NOTE sent blob to socket */
            io.emit('onstream', blob);
        };
        recorder.start(1000);
        pc.createDataChannel("close").onclose = stop
  }); 

    var stop = e => {
        mediaLocal.getTracks().forEach(track => {
            track.stop()
        });
        mediaLocal = null;

        local.srcObject = null
        remote.srcObject = null
        
        pc.onicecandidate = null
        pc.onaddstream = null     
        pc.close()
        pc = newPeer()
    }   

/** NOTE on connect */
io.on('connect', () => {
    console.log("connect socket.io")
    io.on('candidate', async (candidate) =>{
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
    })
    io.on('offer', async (offer) =>{
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        /** TODO sent answer to our server. */
        var r = confirm("Calling!");
        if (r == true) {
            const stream = await navigator.mediaDevices.getUserMedia({audio:true, video:true});            
            if(stream){
                stream.getTracks().forEach((track) => pc.addTrack(track, stream)); 
                local.srcObject = stream;    
                mediaLocal = stream;
                await pc.setLocalDescription(await pc.createAnswer());
                io.emit('answer', pc.localDescription);

                const recorder = new MediaRecorder(stream);
                recorder.ondataavailable = event => {
                    const blob = event.data;
                    /**NOTE sent blob to socket */
                    io.emit('onremote', blob);
                };
                recorder.start(1000);
            }            
        } else {
            return false;
        }  
    })
    io.on('answer', async (answer) =>{
        await pc.setRemoteDescription(answer);
    })
    io.on('onmessage', (message) =>{
        var para = document.createElement("P");
        para.innerHTML = message;
        document.getElementById("txt").appendChild(para);
    })
    io.on('chennel', (chennel) =>{
        console.log(chennel)
    })
    io.on('onstream', (stream) =>{
        console.log(stream)
    })
    io.on('close', (message) =>{
        console.log(message) 
        stop();    
    })
});
io.on('disconnect', () => {
    console.log("disconnect")
})
$(document).ready(function(){
    $('#message').on('click', function(e){
        io.emit('onmessage', $("#txt-input").val());         
        $("#txt-input").val('')    
    });
    /**TODO gennerate dummy room _id  */
    $("#roomId").on('click', function(){
        $("#room").val(uuidv4())        
    });
    $("#join").on('click', function(){
        /* TODO  Join room with room _id */
        io.emit('chennel', $("#room").val());         
    });
    $("#leave").on('click', function(){
        /* TODO  Join room with room _id */
        io.emit('exits', $("#room").val());         
    });
    /* NOTE connect to io */
    $('#connect').on('click', function(e){
        e.preventDefault();
        io.open();      
    });
    /** TODO call start. */
    $("#call").on("click", function(){ 
        start(); 
    });
    $("#hangup").on('click', function(){
        io.emit('close','colse peer connection');           
    });
    $("#stream").on('click', function(){
        io.emit('onstart');           
    });
    $("#disconnect").on('click', function(){
        io.disconnect();         
    });
});
