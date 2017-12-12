


var express = require('express');

// var routes = require('./routes');


var http = require('http');

var path = require('path');


var app = express();

app.use(express.static(path.join(__dirname, 'static')));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


var httpServer =http.createServer(app).listen(8080, function(req,res){

  console.log('Socket IO server has been started');

});

// upgrade http server to socket.io server

var io = require('socket.io').listen(httpServer);
var socket_ids = [];
var count = 0;

function registerUser(socket, nickname) {
  socket.get('nickname', function(err, pre_nick){
    if(pre_nick != undefined ) {
      delete socket_ids[pre_nick];
    }
    socket_ids[nickname] = socket.id
    socket_set('nickname', nickname, function(){
      io.sockets.emit('userlist', {users:Object.keys(socket_ids)});
    });
  });
}
io.sockets.on('connection', function(socket){
  socket.emit('new', {nickname: 'GUEST-'+count});
  registerUser(socket, 'GUEST-'+count);
  count ++;

  socket.on('changename', function(data){
    registerUser(socket, data.nickname);
  });
  socket.on('disconnect', function(data){
    socket.get('nickname', function(err,nickname){
      if(nickname != undefined){
        delete scket_ids[nickname];
        io.sckets.emit('userlist', {users:Object.keys(socket_ids)});
      }
    });
  });
  socket.on('send_msg', function(data){
    socket.get('nickname', function(err, nickname){
      data.msg = nickname + ' : '+data.msg;
      if(data.to == 'ALL') socket.bradcast.emit('broadcast_msg', data);
      else {
        socket_id = socket_ids[data.to];
        if(socket_id != undefined) {
          io.sockets.socket(socket_id).emit('broadcast_msg', data);
        }
      }
      socket.emit('bradcast_msg', data);
    });
  });
});
