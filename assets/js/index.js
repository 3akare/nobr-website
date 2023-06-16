let localStream;
let remoteStream;

let username;
let remoteUser;
const url = new URL(window.location.href);


let peerConnection;
let sendChannel;
let receiveChannel;

let ChatTextArea = document.querySelector('#chat-text-area');

username = url.searchParams.get('username');
remoteUser = url.searchParams.get('remoteuser');

const init = async () => {
  // Get users media devices
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
    // todo: change back to true
  });
  document.querySelector('#user-1').srcObject = localStream;
  createOffer();
};

init();

// Connect to socket.io
const socket = io.connect();

// check user connection
socket.on('connect', () => {
  if (socket.connected) {
    socket.emit('userConnect', {
      displayName: username
    });
  }
});

// Stun servers (From Signaling)
const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302']
    }
  ]
};

const createPeerConnection = async () => {
  // Create RTC peer connections
  peerConnection = new RTCPeerConnection(servers);

  // create channel to receiver remoteStream
  remoteStream = new MediaStream();

  document.querySelector('#user-2').srcObject = remoteStream;
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  remoteStream.oninactive = () => {
    remoteStream.getTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    peerConnection.close();
  };

  peerConnection.onicecandidate = async (event) => {
    // icecandidate supports the exchange of users network information
    if (event.candidate) {
      // send network information to server
      socket.emit('candidateSentToUser', {
        username: username,
        remoteUser: remoteUser,
        iceCandidateData: event.candidate
      });
    }
  };

  sendChannel = peerConnection.createDataChannel('sendDataChannel');
  sendChannel.onopen = () =>{
    console.log('Data chaneel is open');
    onSendChannelStateChange();
  }

  peerConnection.ondatachannel = receiveChannelCallback;
  // sendChannel.onmessage = onSendChannelMessageCallback;
};


function sendData(data){
    ChatTextArea.innerHTML += `
    <div class="flex flex-row justify-end">
                        <div class="text-right block h-fit p-2 w-fit max-w-[80%] bg-red-200 mb-2 rounded-sm">
                            ${data}
                        </div>
                    </div>
`;
    if(sendChannel){
      onSendChannelStateChange();
      sendChannel.send(data);
    }else{
      receiveChannel.send(data);
    }
}

function receiveChannelCallback(event){
  console.log("Receieved Channel Callback");
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveChannelMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveChannelMessageCallback(event){
  console.log('Received Message');
  ChatTextArea.innerHTML += `
  <div class="flex flex-row justify-start">
    <div class="text-left block h-fit p-2 w-fit max-w-[80%] bg-blue-200 mb-2 rounded-sm">
                  ${event.data}
    </div>
  </div> 
`;
}

function onReceiveChannelStateChange(){
  const readystate = receiveChannel.readystate;
  console.log(`Receive Channel state is: ${readystate}`);
  if (readystate === 'open'){
    console.log('Data Channel ready state is open - onReceiveChannelStateChange');
  }
  else{
    console.log('Data Channel ready state is not open - onReceiveChannelStateChange');
  }
}

function onSendChannelStateChange(){
  const readystate = sendChannel.readystate;
  console.log(`Send Channel state is: ${readystate}`);
  if (readystate === 'open'){
    console.log('Data Channel ready state is open - onSendChannelStateChange');
  }
  else{
    console.log('Data Channel ready state is not open - onSendChannelStateChange');
  }
}

const createOffer = async () => {
  // Create RTC peer connections
  createPeerConnection();
  const offer = await peerConnection.createOffer();

  // Set offer as users local description
  await peerConnection.setLocalDescription(offer);

  // Send the offer to remote user
  socket.emit('offerSentToRemote', {
    username: username,
    remoteUser: remoteUser,
    offer: peerConnection.localDescription
  });
};

const createAnswer = async (data) => {
  // Create Answer to user-1 offer
  remoteUser = data.username;
  createPeerConnection();
  await peerConnection.setRemoteDescription(data.offer);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  // Send answer to server
  socket.emit('answerSentToUser1', {
    answer: answer,
    sender: data.remoteUser,
    receiver: data.username
  });
};

socket.on('receivedOffer', function (data) {
  // Receive offer sent by user-1 from the server
  createAnswer(data);
});

const addAnswer = async (data) => {
  // Stores user-2 answer in user-1 remoteDescription
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(data.answer);
  }
};
socket.on('receivedAnswer', function (data) {
  // Receive answer from user-2
  addAnswer(data);
});

socket.on('candidateReceiver', function (data) {
  // Add icecandidate
  peerConnection.addIceCandidate(data.iceCandidateData);
});


const chatText = document.querySelector('#chat');

chatText.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // Prevent default behavior (newline)
    const value = chatText.value.trim(); // Get the trimmed value
    if (value !== '') {
      // Use the value as desired
      // console.log(value);
      sendData(value);
      chatText.value = '';
      chatText.style.height = ""
      // You can perform any other actions here with the value
    }
  }
});
