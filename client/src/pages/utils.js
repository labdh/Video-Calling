import io from "socket.io-client";
import Peer from "peerjs";

const BASE_URL = "http://127.0.0.1:8000"

let socket = io(BASE_URL+"/");

let peer = new Peer({
    host: "127.0.0.1",
    port: 8000,
    path: "/peerjs",

    config: {
      //An ICE server is a STUN or TURN server considered by a WebRTC RTCPeerConnection for self discovery, NAT traversal, and/or relay.
      iceServers: [
        { url: "stun:stun01.sipphone.com" },
        { url: "stun:stun.ekiga.net" },
        { url: "stun:stunserver.org" },
        { url: "stun:stun.softjoys.com" },
        { url: "stun:stun.voiparound.com" },
        { url: "stun:stun.voipbuster.com" },
        { url: "stun:stun.voipstunt.com" },
        { url: "stun:stun.voxgratia.org" },
        { url: "stun:stun.xten.com" },
        {
          url: "turn:192.158.29.39:3478?transport=udp",
          credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
          username: "28224511:1379330808",
        },
        {
          url: "turn:192.158.29.39:3478?transport=tcp",
          credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
          username: "28224511:1379330808",
        },
      ],
    },
    debug: 3,
  });

  export {peer,socket,BASE_URL};