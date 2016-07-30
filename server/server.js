//Requires
const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');
const session = require('express-session');
const http = require('http');
const socket = require('socket.io');

//Init
const app = express();
const server = http.createServer(app);
const io = socket.listen(server);


app.use(express.static(`${__dirname}/../client`));
app.use(session({ secret: 'test code' }));

app.use(session({
  secret: 'test code',
}));

// app.port = process.env.PORT || 3000;

// app.listen(app.port, () => {
//   console.log('We are listening!');
// });

const port = 3000;

server.listen(process.env.PORT || port);
console.log('Listening on port 3000');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for routes
// https://expressjs.com/en/guide/routing.html
app.use('/', router);

app.use(bodyParser.json());

io.on('connection', (socket) => {
  console.log('A user connected')
})
