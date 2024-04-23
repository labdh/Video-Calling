import React, { useEffect, useState } from "react";
import { socket, peer, BASE_URL } from "./utils";
import axios from "axios";
import { useParams } from "react-router-dom";
import $ from "jquery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {

  StopScreenShareOutlined,
  PresentToAll,
  CallEnd,
  Logout
} from "@mui/icons-material";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {
  faClose,
  faComment,
  faFileArrowUp,
  faFileCircleXmark,
  faMicrophone,
  faMicrophoneAltSlash,
  faPaperclip,
  faPaperPlane,
  faPhoneSlash,
  faVideoCamera,
  faVideoSlash,
} from "@fortawesome/free-solid-svg-icons";
import { OwnerMessages, PeerMessages } from "../components/Messages";
import "./Video.css";

const Video = () => {
  const [myVideoStream, setMyVideoStream] = useState();
  const [mute, setMute] = useState(false);
  const [video_div, setVideo] = useState(false);
  const [user, setUser] = useState();
  const [messages, setMessages] = useState([]);
  const [showMessage, setShowMessage] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [file, setFile] = useState(null);
  const [screenMedia, setScreenMedia] = useState();
  const [idOfUser, setidOfUser] = useState();
  const [seconds, setSeconds] = useState(0);
  const [arr, setArr] = useState([0, 0, 0]);

  const { room: ROOM_ID } = useParams();

  // variables for html components
  // variables for html components
  let myVideo;
  let main_right = document.querySelector(".main__right");
  let main_left = document.querySelector(".main__left");
  let send;
  let textDiv;
  let peerId;

  let userInterval;
  let sec;

  useEffect(() => {
    myVideo = document.createElement("video");
    myVideo.addEventListener("click", videoPinHandler);
    sec = $(".timer");
    // myVideo.muted = mute;
    textDiv = $("#chat_message")[0];
    send = $("#send")[0];

    // let user = prompt("Enter name");
    let user = "asd";
    setUser(user);

    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        setMyVideoStream(stream);
        myVideo.classList.add("pin__video");
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
          console.log("someone call me");
          let id = call.options.metadata;

          call.answer(stream);

          const video = document.createElement("video");

          //timer
          //timer
          if (call.metadata.split("/")[1] !== "screen-share") {
            if(!userInterval){
            userInterval = setInterval(() => {
              setSeconds((prev) => {
                if(prev>=5400){
                  endCallHandler();
                }

                if(prev >= 10){
                  $(".timer").css("font-weight",600)
                  $(".timer").css("color","red")
                  $(".header").addClass("redline")
                }
                
                let hours = Math.trunc(prev / 3600);
                let minutes = Math.trunc(prev / 60);
                let seconds = prev - (hours * 3600 + minutes * 60);

                setArr([hours, minutes, seconds]);

                return prev + 1;
              });
            }, 1000);
          }
        }

          //adding videostream of the connecting person
          //adding videostream of the connecting person
          call.on("stream", (userVideoStream) => {
            let videos = $("video");
            console.log(
              userVideoStream,
              "------------------------hjjjjjjj---------------------"
            );
            if (id.split("/")[1] !== "screen-share") {
              for (let i = 0; i < videos.length; i++) {
                if (
                  videos[i].classList.contains("pin__video") &&
                  videos[i] === myVideo
                ) {
                  if ($(".unpinned__video")) {
                    $("video").not(".pin__video").unwrap();
                  }
                  videos[i].classList.remove("pin__video");
                  video.classList.add("pin__video");
                  $("video")
                    .not(".pin__video")
                    .wrapAll("<div class='unpinned__video' ></div>");

                  return;
                }
              }
            }

            video.addEventListener("click", videoPinHandler);
            video.setAttribute("name", id);
            addVideoStream(video, userVideoStream);
          });
        });

        socket.on("user-connected", (recievingId) => {

          if (!userInterval) {
            userInterval = setInterval(() => {
              setSeconds((prev) => {

                if(prev>=5400){
                  endCallHandler();
                }

                if(prev >= 4500){
                  $(".timer").css("font-weight",600)
                  $(".timer").css("color","red")
                  $(".header").addClass("redline")

                }

                let hours = Math.trunc(prev / 3600);
                let minutes = Math.trunc(prev / 60);
                let seconds = prev - (hours * 3600 + minutes * 60);

                setArr([hours, minutes, seconds]);

                return prev + 1;
              });
            }, 1000);
          }

          connectToNewUser(recievingId, stream);
        });
      });

    peer.on("open", (id) => {
      console.log("my id is " + id);
      socket.emit("join-room", ROOM_ID, id, user);
      myVideo.setAttribute("name", id);
      peerId = id;
      setidOfUser(id);
    });

    socket.on("disconnected", (deleteId, name = "") => {
      if (name == "screen-share") {
        $(`video[name='${deleteId + "/screen-share"}']`).remove();
        $("video").not(".pin__video").unwrap();
        if ($("video")?.length === 1) {
          $("video").addClass("pin__video");
        } else {
          $("video").first().addClass("pin__video");
          $("video")
            .not(".pin__video")
            .wrapAll("<div class='unpinned__video' ></div>");
        }
      } else {
        //removing video element when call is cut and that video is on focus OR not
        if ($(`video[name='${deleteId}']`).hasClass("pin__video")) {
          $(`video[name='${deleteId}']`).remove();
          $("video").unwrap();
          $(`video[name='${peerId}']`).addClass("pin__video");
          $("video")
            .not(".pin__video")
            .wrapAll("<div class='unpinned__video' ></div>");
        } else {
          $(`video[name='${deleteId}']`).remove();
        }

        //removing screen-sharing of the call that was cut with screenshare on
        if ($(`video[name='${deleteId + "/screen-share"}']`).length !== 0) {
          $(`video[name='${deleteId + "/screen-share"}']`).remove();
          $("video").unwrap();
          $(`video[name='${peerId}']`).addClass("pin__video");
          $("video")
            .not(".pin__video")
            .wrapAll("<div class='unpinned__video' ></div>");
        }

        //timer
        //timer

        if($("video").length <=1 || ($("video").length ==2 && $(`video[name='${idOfUser}/screen-share']`) )){
        clearInterval(userInterval);
        userInterval = null;

        axios.post(`${BASE_URL}/${ROOM_ID}/timer`, {
          seconds: Number(sec.attr("name")),
        });
      }
      }

      $(".unpinned__video").insertAfter(".pin__video");
    });

    socket.on("end-call", () => {
      console.log("l--asd--ads-asd-sa-d-asd-sa-ds-ad-sa-d-sa-d-a-dsCDA-SD-W-");
      peer.destroy();
      window.open("about:blank", "_self");
      window.close();
    });

    //Event listeners
    //Event listeners
    send.addEventListener("click", messageSender);
    window.addEventListener("resize", windowResizer);
    // $("window").addEventListener("beforeunload",windowClose);

    return () => {
      send.removeEventListener("click", messageSender);
      window.removeEventListener("resize", windowResizer);
      myVideo.removeEventListener("click", videoPinHandler);
      // $("window").removeEventListener("beforeunload",windowClose)
      socket.removeListener("createMessage");
      socket.removeListener("disconnected");
      socket.removeListener("user-connected");
      socket.removeListener("end-call");
    };
  }, []);


  useEffect(() => {
    const getChats = () => {
      axios
        .get(`${BASE_URL}/chats/${ROOM_ID}`)
        .then((res) => {
          let arr = [];
          // console.log(res.data[0].text);
          if (res.data) {
            res.data[0].text.forEach((ele) => {
              if (ele.text.split("/")[0] === "http:") {
                arr.push({ name: ele.name, url: ele.text });
              } else {
                arr.push({ name: ele.name, text: ele.text });
              }
            });
            setMessages(arr);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getChats();

    const timer = () => {
      axios.get(`${BASE_URL}/timer/${ROOM_ID}`).then((res) => {
        const t = res.data.seconds;
        if (t) {
          setSeconds(res.data.seconds);
        }
      });
    };
    timer();
  }, []);

  useEffect(() => {
    let messageBox = $(".messages")[0];
    messageBox.scrollTop = messageBox.scrollHeight;
  }, [messages]);

  useEffect(() => {
    socket.on("screen-connected", (recievingId) => {
      if (screenMedia) {
        peer.call(recievingId, screenMedia, {
          metadata: idOfUser + "/screen-share",
        });
      }
    });
    return () => {
      socket.removeListener("screen-connected");
    };
  }, [screenMedia]);

  //window resize listener
  //window resize listener
  const windowResizer = () => {
    if (document.body.clientWidth <= "700px") {
      setShowMessage(false);
    }
  };

  //message sending function
  //message sending function
  const messageSender = () => {
    if (textDiv.value !== "") {
      socket.emit("message", textDiv.value);
      textDiv.setAttribute("value", "");
    }
  };

  //creating chats array
  //creating chats array
  socket.on("createMessage", (message, userName) => {
    if (message.split("/")[0] === "http:") {
      // console.log(message);
      setMessages([
        ...messages,
        { name: userName, text: message, url: message },
      ]);
    } else {
      setMessages([...messages, { name: userName, text: message }]);
    }
    socket.removeListener("createMessage");
  });

  //toggle comment container
  //toggle comment container
  const commentHandler = (e) => {
    e.preventDefault();
    main_right.classList.toggle("showChat");
    main_left.classList.toggle("showMain");
    setShowMessage(!showMessage);
  };

  //Pin the video
  //Pin the video
  // ------------------------------------------------------
  const videoPinHandler = (e) => {
    //when unpinned video is selected

    //unpinning video
    if (e.target.classList.contains("pin__video")) {
      $("video").not(".pin__video").unwrap();
      e.target.classList.remove("pin__video");
    }

    //pinning video
    else if (!e.target.classList.contains("pin__video")) {
      let videos = $("video");
      for (let i = 0; i < videos.length; i++) {
        if (videos[i].classList.contains("pin__video")) {
          $("video").not(".pin__video").unwrap();
          videos[i].classList.remove("pin__video");
          e.target.classList.add("pin__video");
          $("video")
            .not(".pin__video")
            .wrapAll("<div class='unpinned__video' ></div>");
          $(".unpinned__video").insertAfter($(".pin__video"));

          return;
        }
      }

      e.target.classList.add("pin__video");
      $("video")
        .not(".pin__video")
        .wrapAll("<div class='unpinned__video' ></div>");
      $(".unpinned__video").insertAfter($(".pin__video"));
    }
  };
  // ------------------------------------------------------

  //addVideoStream to play video stream got from navigator
  //addVideoStream to play video stream got from navigator
  const addVideoStream = async (video, stream) => {
    video.srcObject = stream;
    video.play();
    let videos = $("video");

    if (video.getAttribute("name").split("/")[1] === "screen-share") {
      if ($(".unpinned__video")) {
        $("video").not(".pin__video").unwrap();
      }
      $(".pin__video").removeClass("pin__video");
      video.classList.add("pin__video");
      $("video")
        .not(".pin__video")
        .wrapAll("<div class='unpinned__video' ></div>");
    } else {
      for (let i = 0; i < videos.length; i++) {
        if (videos[i].classList.contains("pin__video")) {
          // console.log($(".unpinned__video"));
          $(".unpinned__video")[0].append(video);
          return;
        }
      }
    }
    $("#video-grid").append(video);
    $(".unpinned__video").insertAfter($(".pin__video"));
  };

  const connectToNewUser = (recieverId, stream) => {
    // console.log(peerId);
    const call = peer.call(recieverId, stream, { metadata: peerId });
    const video = document.createElement("video");

    video.setAttribute("name", recieverId);

    //adding videostream of the user
    //adding videostream of the user
    call.on("stream", (userVideoStream) => {
      console.log("ggjvjhhbhkkjbkkbhbhbjhbhkkkbkkkhb");

      let videos = $("video");
      for (let i = 0; i < videos.length; i++) {
        if (
          videos[i].classList.contains("pin__video") &&
          videos[i] === myVideo
        ) {
          $("video").not(".pin__video").unwrap();
          videos[i].classList.remove("pin__video");
          video.classList.add("pin__video");
          $("video")
            .not(".pin__video")
            .wrapAll("<div class='unpinned__video' ></div>");

          return;
        }
      }
      video.addEventListener("click", videoPinHandler);
      addVideoStream(video, userVideoStream);
      $(".unpinned__video").insertAfter($(".pin__video"));
    });
  };

  //Muting audio
  //Muting audio
  const muteHandler = () => {
    myVideoStream.getAudioTracks()[0].enabled =
      !myVideoStream.getAudioTracks()[0].enabled;
    setMute(!mute);
  };

  //Stopping video
  //Stopping video
  const stopVideo = () => {
    myVideoStream.getVideoTracks()[0].enabled =
      !myVideoStream.getVideoTracks()[0].enabled;
    setVideo(!video_div);
  };

  //leaving the call
  //leaving the call
  const leaveHandler = (e) => {
    // console.log("sadassad");

    // console.log({timer:{hours:hours,minutes:minutes,seconds:seconds}});

    socket.emit("disconnected");
    peer.destroy();
    window.open("about:blank", "_self");
    window.close();
  };

  const endCallHandler = () => {
    socket.emit("end-call");
    socket.emit("disconnected");
    peer.destroy();
    window.open("about:blank", "_self");
    window.close();
  };

  const windowClose = () => {
    socket.emit("disconnected");
    peer.destroy();
    window.open("about:blank", "_self");
    window.close();
  };

  //on choosing file for chats
  //on choosing file for chats
  const onFileChange = (e) => {
    if (e.target.files[0].size < 4000000) {
      setFile(e.target.files[0]);
      e.target.files = null;
      $(".main__chat_window").css("marginBottom", "50px");
    } else {
      alert("Size of file should be less than 4MB");
    }
  };

  //on clicking uplaod button
  //on clicking uplaod button
  const onFileUpload = async () => {
    const formData = new FormData();
    formData.append("filename", file.name);
    formData.append("file", file);
    alert("File will upload as soon as upload option disappears");
    let fileUrl = await axios
      .post(`${BASE_URL}/file/upload`, formData)
      .then((res) => res.data)
      .catch((err) => err);
    setFile(null);
    $(".main__chat_window").css("marginBottom", "0px");
    socket.emit("message", fileUrl);
    $("#file__input").val("");
    // $("#file__input")[0].val(null);
  };

  const onFileCancelUpload = () => {
    $(".main__chat_window").css("marginBottom", "0px");
    $("#file__input").val("");
    setFile(null);
  };

  const startScreenSharing = () => {
    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: true,
      })
      .then((stream) => {
        const video = document.createElement("video");
        video.addEventListener("click", videoPinHandler);
        video.setAttribute("name", idOfUser + "/screen-share");

        setScreenMedia(stream);

        stream.getVideoTracks()[0].onended = () => {
          socket.emit("disconnected", "screen-share");
          setScreenShare(false);
          setScreenMedia(null);
        };

        // let call;
        let videos = document.querySelectorAll("video");
        for (let i = 0; i < videos.length; i++) {
          if (videos[i].getAttribute("name") != idOfUser) {
            peer.call(videos[i].getAttribute("name"), stream, {
              metadata: idOfUser + "/screen-share",
            });
          }
        }

        addVideoStream(video, stream);
      });

    setScreenShare(!screenShare);
  };

  const stopScreenSharing = () => {
    screenMedia.getVideoTracks()[0].stop();
    setScreenShare(false);
    setScreenMedia(null);

    socket.emit("disconnected", "screen-share");

    // $("video").addClass("pin__video");
    // $("video").not(".pin__video").wrapAll("<div class='unpinned__video' ></div>")
  };

  // const stop = () => {
  //   peer.disconnect();
  //   peer.destroy();
  // }

  // ------------------------------------------------------------------------------------------------------------------------
  return (
    <div className="app">
      <div className="header">
        <div className="logo">
          <h4 style={{ color: "white" }}>Designation: XYZ</h4>
          <h3 style={{ color: "white" }}>Mock Interview by Mr/Mrs ABC</h3>
          <h4 style={{ color: "white" }}>Organization: PQR</h4>
          {/* ---------------------------------------------- */}
          {/* ---------------------------------------------- */}

          <div style={{ fontSize: "18px", color: "white" }}>
            <span className="timer" name={seconds} color="green">
              <span >
                {arr[0]<10 ? "0"+arr[0] : arr[0] } :
              </span>
              <span >
                {arr[1]<10 ? "0"+arr[1] : arr[1]} :
              </span>
              <span >
                {arr[2]<10 ? "0"+arr[2] : arr[2]}
              </span>
            </span>
          </div>
          {/* ---------------------------------------------- */}
          {/* ---------------------------------------------- */}
        </div>
      </div>
      <div className="main">
        <div className="main__left">
          <div className="videos__group">
            <div id="video-grid"></div>
          </div>
          <div className="options">
            <div className="options__left">
              {video_div ? (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip className="tooltip">TURN Video ON</Tooltip>}
                >
                  <div
                    id="stopVideo"
                    className="options__button"
                    style={{ backgroundColor: "red", color: "white" }}
                  >
                    <FontAwesomeIcon icon={faVideoSlash} onClick={stopVideo} />
                  </div>
                </OverlayTrigger>
              ) : (
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip className="tooltip">TURN Video OFF</Tooltip>
                  }
                >
                  <div id="stopVideo" className="options__button">
                    <FontAwesomeIcon icon={faVideoCamera} onClick={stopVideo} />
                  </div>
                </OverlayTrigger>
              )}
              {mute ? (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip className="tooltip">Unmute</Tooltip>}
                >
                  <div
                    id="muteButton"
                    className="options__button"
                    onClick={muteHandler}
                    style={{ backgroundColor: "red", color: "white" }}
                  >
                    <FontAwesomeIcon icon={faMicrophoneAltSlash} />
                  </div>
                </OverlayTrigger>
              ) : (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip className="tooltip">Mute</Tooltip>}
                >
                  <div
                    id="muteButton"
                    className="options__button"
                    onClick={muteHandler}
                  >
                    <FontAwesomeIcon icon={faMicrophone} />
                  </div>
                </OverlayTrigger>
              )}
              {/* <div id="muteButton" className="options__button">
              <FontAwesomeIcon icon={faTabletScreenButton} />
            </div> */}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip className="tooltip">Leave Call</Tooltip>}
              >
                <div
                  id="exitButton"
                  className="options__button"
                  style={{ backgroundColor: "red" }}
                  onClick={leaveHandler}
                >
                  <CallEnd
                    style={{ color: "white" }}
                  />
                </div>
              </OverlayTrigger>

              {/* ------------------END THE CALL FOR ALL-------------------- */}
              {/* ------------------END THE CALL FOR ALL-------------------- */}
              {/* <OverlayTrigger
                placement="top"
                overlay={<Tooltip className="tooltip">End Call</Tooltip>}
              >
                <div
                  id="inviteButton"
                  className="options__button screenSharing"
                  style={{ backgroundColor: "red", color: "white" }}
                  onClick={endCallHandler}
                >
                  <Logout />
                </div>
              </OverlayTrigger> */}
              {/* ------------------END THE CALL FOR ALL-------------------- */}
              {/* ------------------END THE CALL FOR ALL-------------------- */}

              {screenShare ? (
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip className="tooltip">Cancel Screen Share</Tooltip>
                  }
                >
                  <div
                    id="inviteButton"
                    className="options__button"
                    style={{ backgroundColor: "red", color: "white" }}
                    onClick={stopScreenSharing}
                  >
                    <StopScreenShareOutlined
                      onClick={() => {
                        setScreenShare(!screenShare);
                      }}
                    />
                  </div>
                </OverlayTrigger>
              ) : (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip className="tooltip">Screen Share</Tooltip>}
                >
                  <div
                    id="inviteButton"
                    className="options__button screenSharing"
                    onClick={startScreenSharing}
                  >
                    <PresentToAll />
                  </div>
                </OverlayTrigger>
              )}
            </div>
            <div className="options__right">
              {!showMessage && (
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip className="tooltip">Chats</Tooltip>}
                >
                  <div
                    id=""
                    className="options__button"
                    onClick={commentHandler}
                  >
                    <FontAwesomeIcon icon={faComment} />
                  </div>
                </OverlayTrigger>
              )}
            </div>
          </div>
        </div>
        <div className="main__right">
          <div className="main__chat_window">
            {showMessage && (
              <div
                id="comment__cancel"
                className=""
                onClick={commentHandler}
                style={{ cursor: "pointer" }}
              >
                <FontAwesomeIcon icon={faClose} color="white" size="1x" />
              </div>
            )}

            <div className="messages" style={{ paddingTop: "20px" }}>
              {messages.map((message, index) =>
                user !== message.name ? (
                  <OwnerMessages
                    key={index}
                    name={message.name}
                    text={message.text}
                    url={message.url}
                  />
                ) : (
                  <PeerMessages
                    key={index}
                    name={message.name}
                    text={message.text}
                    url={message.url}
                  />
                )
              )}
            </div>
          </div>
          <div className="main__message_container">
            {file && (
              <div className="file__upload">
                <p
                  className="message__text"
                  style={{
                    flex: "1",
                    display: "flex",
                    maxHeight: "50px",
                    backgroundColor: "lightpink",
                  }}
                >
                  {file.name.substring(0, 30)}...
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip className="tooltip">Send File</Tooltip>}
                  >
                    <label
                      id="send"
                      className="options__button"
                      onClick={onFileUpload}
                      style={{ backgroundColor: "green", color: "white" }}
                    >
                      <FontAwesomeIcon icon={faFileArrowUp} />
                    </label>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip className="tooltip">Cancel File</Tooltip>}
                  >
                    <label
                      id="send"
                      className="options__button"
                      onClick={onFileCancelUpload}
                      style={{ backgroundColor: "red", color: "white" }}
                    >
                      <FontAwesomeIcon icon={faFileCircleXmark} />
                    </label>
                  </OverlayTrigger>
                </p>
              </div>
            )}
            <input
              id="chat_message"
              type="text"
              autocomplete="off"
              placeholder="Type message here..."
            />
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip className="tooltip">Send Message</Tooltip>}
            >
              <div id="send" className="options__button">
                <FontAwesomeIcon icon={faPaperPlane} />
              </div>
            </OverlayTrigger>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip className="tooltip">Choose File</Tooltip>}
            >
              <label
                id="send"
                htmlFor="file__input"
                className="options__button"
              >
                <FontAwesomeIcon icon={faPaperclip} />
              </label>
            </OverlayTrigger>

            {/* {file && (
            <label
              id="send"
              className="options__button"
              onClick={onFileUpload}
            >
              <FontAwesomeIcon icon={faFileArrowUp} />
            </label>
          )} */}
            <input
              type="file"
              id="file__input"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;
