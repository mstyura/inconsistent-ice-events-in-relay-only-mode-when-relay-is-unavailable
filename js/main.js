"use strict";

// Possible bad cases of TURN servers:
// DNS issues: not resolved, resolved to wrong IP (e.g. internal instead of external address)
// IP routing issues: host in unreachable
// TLS issues: invalid certificate for multiple reasons
// TURN issues: not a turn server, wrong credential
const badTurnServers = [{
    urls: ["turns:stun.l.google.com:19302?transport=tcp"],
    username: "123123:bad",
    credential: "bad-bad"
}]

const producerPC = new RTCPeerConnection({
    iceTransportPolicy: 'relay',
    iceServers: badTurnServers
});
const consumerPC = new RTCPeerConnection({
    iceTransportPolicy: 'relay',
    iceServers: badTurnServers
});

// 
producerPC.addEventListener("icecandidate", async (event) => {
    console.log("Producer PC ice candidate: ", event.candidate)
    await consumerPC.addIceCandidate(event.candidate);
});
producerPC.addEventListener('icecandidateerror', (event) => {
    console.log("Producer PC ice candidate error: ", event.error, event)
})
producerPC.addEventListener('iceconnectionstatechange', (event) => {
    console.log("Producer PC ice connection state changed: ", event.target.iceConnectionState, event)
})
producerPC.addEventListener('icegatheringstatechange', (event) => {
    console.log("Producer PC ice gathering state changed: ", event.target.iceGatheringState, event)
})
producerPC.addEventListener('connectionstatechange', (event) => {
    console.log("Producer PC connection state changed: ", event.target.connectionState, event)
})

// 
consumerPC.addEventListener("icecandidate", async (event) => {
    console.log("Consumer PC ice candidate: ", event.candidate)
    await producerPC.addIceCandidate(event.candidate);
});
consumerPC.addEventListener('icecandidateerror', (event) => {
    console.log("Consumer PC ice candidate error: ", event.error, event)
})
consumerPC.addEventListener('iceconnectionstatechange', (event) => {
    console.log("Consumer PC ice connection state changed: ", event.target.iceConnectionState, event)
})
consumerPC.addEventListener('icegatheringstatechange', (event) => {
    console.log("Consumer PC ice gathering state changed: ", event.target.iceGatheringState, event)
})
producerPC.addEventListener('connectionstatechange', (event) => {
    console.log("Consumer PC connection state changed: ", event.target.connectionState, event)
})

const reproduceNoIceGatheringCompleteNoIceConnectionStateFailed = async () => {
    console.log("Will reproduce absence of ICE related events");

    producerPC.addTransceiver('audio', {
        direction: "sendonly",
    });
  
    await producerPC.setLocalDescription();
    await consumerPC.setRemoteDescription(producerPC.localDescription);
    await consumerPC.setLocalDescription();
    await producerPC.setRemoteDescription(consumerPC.localDescription);

    for (let i = 0; i < 10; i++) {
        console.log(`Producer PC(i=${i}): signalingState=${producerPC.signalingState}, connectionState=${producerPC.connectionState}, iceGatheringState=${producerPC.iceGatheringState}, iceConnectionState=${producerPC.iceConnectionState}`)
        console.log(`Consumer PC(i=${i}): signalingState=${consumerPC.signalingState}, connectionState=${consumerPC.connectionState}, iceGatheringState=${consumerPC.iceGatheringState}, iceConnectionState=${consumerPC.iceConnectionState}`)
        await new Promise((resolve, _) => {
            setTimeout(resolve, 5000)
        })
    }
};

reproduceNoIceGatheringCompleteNoIceConnectionStateFailed()