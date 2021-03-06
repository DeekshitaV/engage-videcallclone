const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4 : uuidv4 } = require("uuid");
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer( server , {
    debug : true,
});
app.set('view engine', 'ejs');
app.use('/peerjs' , peerServer);
app.use(express.static('public'));


app.get("/" , (req,res) =>{
    res.redirect("https://roomchat-deekshitaverma.herokuapp.com/");
});
 


app.get('/:room' , (req,res) =>{
    res.render('CallRoom' , {roomId: req.params.room});
});



io.on('connection' , (socket) => {
    socket.on('joinRoom' , ( roomId , userId, userName) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('userConnected' , userId);  
        socket.on('disconnect' , () => {
            socket.broadcast.to(roomId).emit('user-disconnected' , userId);
        });
    });
});

server.listen(process.env.PORT || 3030);

