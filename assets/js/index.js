let localStream;
let remoteStream;

let username;
let remoteUser;
const url = new URL(window.location.href);


let peerConnection;
let sendChannel;
let receiveChannel;

let ChatTextArea = document.querySelector('#chat-text-area');

//Get userID
let nobruserID = localStorage.getItem('nobruserID');

// Set Up userID
if (nobruserID){
  username = nobruserID;
  $.ajax({
    type: 'PUT',
    url: `/new-user-update/${nobruserID}`,
    success: function(response){
      console.log(response);
    }
  })
  
}else{
  // Set up userID if this is first time user
  let postData = "Demo Data";

$.ajax({
  type: "POST",
  url: "/api/users",
  data: postData,
  success: function(response){
    console.log(`New: ${response}`);
    localStorage.setItem('nobruserID', response);
    username = response;
  },
  error: function(error){
    console.log(error);
  }
})
}


// remoteUser = url.searchParams.get('remoteuser');
// todo: fix this
// function checkCamera(){
//   if (window.location.href === 'http://localhost:3000/video-chat'){
//     return true;
//   }
//   else{
//     return false;
//   }
// }

const init = async () => {
  // Get users media devices
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
    // todo: change back to true
  });
  document.querySelector('#user-1').srcObject = localStream;

  $.post('http://localhost:3000/get-remote-users', {nobruserID: nobruserID})
  .done(function(data){
    if (data[0]){
      if (data[0]._id == remoteUser || data[0]._id == username){
      }else{
        remoteUser = data[0]._id
      }
    }
    createOffer();
  }).fail(function(xhr, textStatus, errorThrown){
    console.log(xhr.responseText);
  })
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

const lastChild = document.querySelector('#chat-text-area').lastElementChild
function sendData(data){
  const newElement = document.createElement("div");
  newElement.className = "w-full flex justify-end text-white overflow-auto";
  newElement.innerHTML = `
      <div class="bg-purple-400 my-1 p-2 rounded-sm max-w-[75%]" style="overflow: auto;">
          ${data}
      </div>
  `;
  
    ChatTextArea.insertBefore(newElement, lastChild);
    scrollElementIntoView();

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
  const newElement = document.createElement("div");
    newElement.className = "w-full flex justify-start text-white overflow-auto";
    newElement.innerHTML = `
        <div class="bg-blue-400 my-1 p-2 rounded-sm max-w-[75%]" style="overflow: auto;">
            ${event.data}
        </div>
    `;
    ChatTextArea.insertBefore(newElement, lastChild);
    scrollElementIntoView();
}

const scrollIntoViewElement = document.getElementById("scrollintoview");
function scrollElementIntoView() {
  scrollIntoViewElement.scrollIntoView({ behavior: "smooth" });
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

function fetchNextUser(remoteUser){
  $.post('http://localhost:3000/get-next-user',
  {
    nobruserID: nobruserID,
    remoteUser: remoteUser
  },
    function(data){
      console.log('Next User is: ', data);
      if (data[0]){
        if (data[0]._id == remoteUser || data[0]._id == username){
        }else{
          remoteUser = data[0]._id
        }
        createOffer();
      }
    })
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

  $ajax({
    url: `/update-on-engagment/${username}`,
    type: 'PUT',
    success: function(response){

    }
  })
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

  // document.querySelector('#nextChat').
  $ajax({
    url: `/update-on-engagment/${username}`,
    type: 'PUT',
    success: function(response){
      
    }
  })
};
socket.on('receivedAnswer', function (data) {
  // Receive answer from user-2
  addAnswer(data);
});

socket.on('closedRemoteUser', function (data) {
  $.ajax({
    url: `/update-on-next/${username}`,
    type: 'PUT',
    success: function(response){
      fetchNextUser(remoteUser);
    }
  })
});

socket.on('candidateReceiver', function (data) {
  // Add icecandidate
  peerConnection.addIceCandidate(data.iceCandidateData);
});


const chatText = document.querySelector('#chat');
document.querySelector('#sendTextButton').addEventListener('click', (event)=>{
  const value = chatText.value.trim(); // Get the trimmed value
  if (value !== '') {
    // Use the value as desired
    // console.log(value);
    sendData(value);
    chatText.value = '';
    chatText.style.height = ""
    // You can perform any other actions here with the value
  }
})

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


window.addEventListener('beforeunload', function(event){
  $.ajax({
    url: `/leaving-user-update/${username}`,
    type: 'PUT',
    success: function(response){
      console.log(response);
    }
  })
})

async function closeConnection(){
  await peerConnection.close();
  await socket.emit('remoteUserClosed', {
    username: username,
    remoteUser: remoteUser
  })
  $.ajax({
    url: `/update-on-next/${username}`,
    type: 'PUT',
    success: function(response){
      fetchNextUser(remoteUser);
    }
  })
}


document.querySelector('#nextChat').addEventListener('click', function(){
  document.querySelector('#chat-text-area').innerHTML = '';
  if (peerConnection.connectionState === "connected" || peerConnection.iceCandidateState === 'connected'){
    closeConnection();
    console.log('user closed');
  }else{
    fetchNextUser(remoteUser);
    console.log('Moving to next user');
  }
})