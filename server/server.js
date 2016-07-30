// Requires
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');
const session = require('express-session');
const http = require('http');
const SocketIo = require('socket.io');

// Init
const app = express();
const server = http.createServer(app);
const io = SocketIo.listen(server);

// Config
const EXPRESS_PORT = 3000;

// Routes
app.use(express.static(`${__dirname}/../client`));

// Sessions init
app.use(session({ secret: 'test code' }));

// Ajax config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for routes
// https://expressjs.com/en/guide/routing.html
app.use('/', router);

// does this need to be here?
app.use(bodyParser.json());

// Socket.io
io.on('connection', (socket) => {
  console.log('A user connected with socket id', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected wit hscoket id', socket.id);
  });

  socket.on('add message', (message) => {
    console.log('received add message request');
    socket.broadcast.emit('add message', message);
  });
});

server.listen(process.env.PORT || EXPRESS_PORT);
console.log(`Listening on port ${EXPRESS_PORT}`);
