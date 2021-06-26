const socket = io('/');

let myVideoStream;
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const showChat = document.querySelector('#chat');
myVideo.muted = true;

showChat.addEventListener("click", () => {
    if( document.querySelector(".main-right").style.display === "flex"  )
   {
        document.querySelector(".main-right").style.display = "none";
   }
   else{
    document.querySelector(".main-right").style.display = "flex";  
   }
});


//enter display name
const user = prompt('Enter your display name');

//peer to connect to WebRTC
var peer = new Peer( undefined , {
    path : '/peerjs',
    host : '/',
    port : '443',
});


//take audio video permissions
navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
})
//once taken start streaming video
.then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    //listen to Call event
    peer.on('call', (call) => {
        call.answer(stream);
        const video = document.createElement("video");
        //listen to Stream
        call.on('stream' , (userVideoStream) => {
            addVideoStream( video, userVideoStream);
        });
    });
    //listen to userConnected
    socket.on('userConnected', (userId) => {
        connectToNewUser(userId,stream);
    });
});



//create function connectToNewUser
const connectToNewUser = (userId,stream)=>{
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream' , userVideoStream => {
       addVideoStream( video , userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });
    window.onunload() = () => {
        socket.emit('user-disconnected' , userId);
    };

};

//create function addVideoStream
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
       video.play();
       videoGrid.append(video);
    });
};

peer.on('open' , (id) => {
    socket.emit('joinRoom' , ROOM_ID , id , user);
});

socket.on('user-disconnected', (userId) => {
    if (peers[userId]) 
    peers[userId].close();
});

let text = document.querySelector('#chat-message');
let send = document.getElementById('send');
let messages = document.querySelector('.messages');

send.addEventListener("click" , (e) => {
   if(text.value.length !== 0 ){
       socket.emit("message" , text.value);
       text.value = "";
   }
});

text.addEventListener("keydown" , (e) => {
    if(e.key === "Enter" && text.value.length !== 0 ){
        socket.emit("message" , text.value);
        text.value = "";
    }
});

const invite = document.querySelector('#invite');
const mic = document.querySelector('#mic');
const video = document.querySelector('#Video');

video.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      html = `<i class="fas fa-video-slash"></i>`;
      video.innerHTML = html;
    } else {
      myVideoStream.getVideoTracks()[0].enabled = true;
      html = `<i class="fas fa-video"></i>`;
      video.innerHTML = html;
    }
  });

mic.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      html = `<i class="fas fa-microphone-slash"></i>`;
      mic.innerHTML = html;
    } else {
      myVideoStream.getAudioTracks()[0].enabled = true;
      html = `<i class="fas fa-microphone"></i>`;
      mic.innerHTML = html;
    }
});

const currentpage = window.location.href;

invite.addEventListener("click", (e) => {
     var link = 'mailto:attendee@example.org?Subject:Join My Teams Meeting&body=Link to my meeting : ' + currentpage; 
     window.open(link);

});

socket.on("create-message", (message, userName) => {
    messages.innerHTML =
      messages.innerHTML +
      `<div class="message">
          <b><i class="far fa-user-circle"></i> <span> ${
            userName === user ? "me" : userName
          }</span> </b>
          <span>${message}</span>
      </div>`;
  });