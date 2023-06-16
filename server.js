const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set view engine to html
app.set('view engine', 'ejs');

app.use('/css', express.static(path.resolve(__dirname, 'assets/css')));
app.use('/images', express.static(path.resolve(__dirname, 'assets/images')));
app.use('/js', express.static(path.resolve(__dirname, 'assets/js')));
app.use('/font', express.static(path.resolve(__dirname, 'assets/font')));

app.use('/', require('./server/routes/router'));

const server = app.listen(PORT, () => {
  console.log(`Connected on PORT ${PORT}`);
});

const io = require('socket.io')(server, {
  allowEI03: true // Avoiding server mis-match issues
});

// track the user joined
let userConnections = [];

// Check if socket.io is connected with the frontend
io.on('connection', (socket) => {
  console.log(`Socket id is ${socket.id}`);
  socket.on('userConnect', (data) => {
    console.log(`Logged in user: ${data.displayName}`);

    // Add user to userConnections array
    userConnections.push({
      connectionId: socket.id,
      user_id: data.displayName
    });
    console.log(`User count: ${userConnections.length}`);
  });

  socket.on('offerSentToRemote', (data) => {
    // Collect offer from user-1 and send to user-2
    const offerReceiver = userConnections.find((o) => o.user_id === data.remoteUser);
    if (offerReceiver) {
      console.log(`offer receiver ${offerReceiver.connectionId}`);
      socket.to(offerReceiver.connectionId).emit('receivedOffer', data);
    }
  });

  socket.on('answerSentToUser1', (data) => {
    // Collect answer from user-2
    const answerReceiver = userConnections.find((o) => o.user_id === data.receiver);
    if (answerReceiver) {
      console.log(`answer receiver ${answerReceiver.connectionId}`);
      socket.to(answerReceiver.connectionId).emit('receivedAnswer', data);
    }
  });

  socket.on('candidateSentToUser', (data) => {
    // receive ice candidate network information
    const candidateReceiver = userConnections.find((o) => o.user_id === data.remoteUser);
    if (candidateReceiver) {
      console.log(`candidateReceiver user is: ${candidateReceiver.connectionId}`);
      socket.to(candidateReceiver.connectionId).emit('candidateReceiver', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    // let disUser = userConnections.find((p) => (p.connectionId = socket.id));
    // if (disUser) {
    userConnections = userConnections.filter((p) => p.connectionId !== socket.id);
    console.log(
      'Rest users username are: ',
      userConnections.map(function (user) {
        return user.user_id;
      })
    );
    // }
  });
});
