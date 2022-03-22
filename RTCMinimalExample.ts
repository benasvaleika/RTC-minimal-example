import { iceServers } from "../../utils/constants";

// DataChannels
let receiveChannel: any;
let sendChannel: any;

export const createConnection = async () => {
  // RTCPeers
  const localConnection = new RTCPeerConnection({ iceServers });
  const remoteConnection = new RTCPeerConnection({ iceServers });

  // Assign sendChannel
  sendChannel = localConnection.createDataChannel("sendDataChannel");
  sendChannel.binaryType = "arraybuffer";

  // Assign receiveChannel
  remoteConnection.ondatachannel = receiveChannelCallback;

  // Ice candidate listeners
  localConnection.addEventListener("icecandidate", async (event) => {
    console.log("Local ICE candidate: ", event.candidate);
    if (event.candidate) {
      await remoteConnection.addIceCandidate(event.candidate);
    }
  });

  remoteConnection.addEventListener("icecandidate", async (event) => {
    console.log("Remote ICE candidate: ", event.candidate);
    if (event.candidate) {
      await localConnection.addIceCandidate(event.candidate);
    }
  });

  // Offer Answer exchange
  const rtcOffer = localConnection.createOffer();
  localConnection.setLocalDescription(await rtcOffer);
  remoteConnection.setRemoteDescription(await rtcOffer);
  const rtcAnswer = remoteConnection.createAnswer();
  remoteConnection.setLocalDescription(await rtcAnswer);
  localConnection.setRemoteDescription(await rtcAnswer);

  // Sending message for testing purposes
  setTimeout(function () {
    if (sendChannel.readyState === "open") {
      sendChannel.send("This is some data");
      console.log("Some data sent");
    } else {
      console.log("Tried to send a message");
      console.log(sendChannel);
    }
  }, 3000);
};

function receiveChannelCallback(event: RTCDataChannelEvent) {
  receiveChannel = event.channel;
  receiveChannel.onmessage = handleReceiveMessage;
  receiveChannel.onopen = handleReceiveChannelStatusChange;
  receiveChannel.onclose = handleReceiveChannelStatusChange;
}

function handleReceiveMessage(event: MessageEvent<any>) {
  console.log("Message received");
  console.log(event);
}

function handleReceiveChannelStatusChange(event: any) {
  if (receiveChannel) {
    console.log(
      "Receive channel's status has changed to " + receiveChannel.readyState
    );
  }
}

function sendMessage() {
  const message = "this is a message";
  sendChannel.send(message);
}
