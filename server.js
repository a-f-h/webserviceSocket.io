var path = require('path');
var app = require('express')();
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

users = [];
connections = [];


var socketPort =  process.env.PORT || 3003;

server.listen(socketPort);
console.log('Socket.io Server running on port: ' + socketPort);


app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '/index.html'));
});


app.get('/chat', function(req, res){
  res.sendFile(path.join(__dirname, '/chat.html'));
});



io.sockets.on('connection', function(socket){

Object.keys(io.sockets.sockets).forEach(function(id) {
    console.log("ID:",id)  // socketId
    // send num of concurrent connections to client
  io.sockets.emit('update socketids', {sid: id});

})


	//connect
	connections.push(socket);
	console.log('--New user connected--');
	console.log('Connections: %s sockets connected', connections.length);

  // send num of concurrent connections to client
  io.sockets.emit('update connections', {noc: connections.length});

	//disconnect
  socket.on('disconnect', function(data){
  	users.splice(users.indexOf(socket.username),1);
  	updateUsernames();
  	connections.splice(connections.indexOf(socket),1);
    console.log('--Existing user disconnected--');
	console.log('Connections: %s sockets connected', connections.length);
  });

  // send message
  socket.on('send message', function(data){

  		console.log(data);
      if(data.length > 0){
  		io.sockets.emit('new message', {msg: data, usr: socket.username});
    }
    else{
      io.sockets.emit('throw msgError');
    }

  });

  // new user
  socket.on('new user', function(data, callback){
  		if(data.length > 0){
  			callback(true);
  			socket.username = data;
  			users.push(socket.username);
  			updateUsernames();
  		}
  		else{
  			callback(false);
  			io.sockets.emit('throw usrError');
  		}
  		
  });


  function updateUsernames(){
  	io.sockets.emit('get users', users);
   // io.sockets.emit('update connections', {noc: connections.length});
  }
});



