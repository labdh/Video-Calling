import React, { useEffect, useState } from "react";
import { socket, peer, BASE_URL } from "./utils";
import axios from "axios";
import { useParams } from "react-router-dom";
import $ from "jquery";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ScreenShareOutlined,
  StopScreenShareOutlined,
} from "@mui/icons-material";
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

  const { room: ROOM_ID } = useParams();

  // variables for html components
  // variables for html components
  let videoGrid;
  let myVideo;
  let backBtn;
  let main_right = document.querySelector(".main__right");
  let main_left = document.querySelector(".main__left");
  let send;
  let textDiv;

  useEffect(() => {
    videoGrid = $("#video-grid");
    myVideo = document.createElement("video");
    myVideo.addEventListener("click", videoPinHandler);
    // myVideo.muted = mute;
    backBtn = $(".header__back")[0];
    textDiv = $("#chat_message")[0];
    send = $("#send")[0];

    // let user = prompt("Enter name");
    let user = "asd";
    setUser(user);
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then((stream) => {
        setMyVideoStream(stream);
        myVideo.classList.add("pin__video");
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
          console.log("someone call me");
          call.answer(stream);
          const video = document.createElement("video");

          //adding videostream of the connecting person
          //adding videostream of the connecting person
          call.on("stream", (userVideoStream) => {
            let videos = $("video");
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
                setTimeout(() => {
                  $(".unpinned__video").insertAfter($(".pin__video"));
                }, 500);

                return;
              }
            }
            video.addEventListener("click", videoPinHandler);
            addVideoStream(video, userVideoStream);
          });
        });
        socket.on("user-connected", (userId) => {
          connectToNewUser(userId, stream);
        });
      });

    peer.on("open", (id) => {
      console.log("my id is " + id);
      socket.emit("join-room", ROOM_ID, id, user);
      myVideo.setAttribute("name", id);
    });

    peer.on("disconnected", (id) => {
      console.log("This id got disconneted", id);
    });

    //Event listeners
    //Event listeners
    send.addEventListener("click", messageSender);
    window.addEventListener("resize", windowResizer);

    return () => {
      send.removeEventListener("click", messageSender);
      window.removeEventListener("resize", windowResizer);
      myVideo.removeEventListener("click", videoPinHandler);
      // socket.removeListener("createMessage");
    };
  }, []);

  useEffect(() => {
    const getChats = async () => {
      axios
        .get(`${BASE_URL}/chats/${ROOM_ID}`)
        .then((res) => {
          let arr = [];
          res.data[0].text.forEach((ele) => {
            if (ele.text.split("/")[0] === "http:") {
              arr.push({ name: ele.name, url: ele.text });
            } else {
              arr.push({ name: ele.name, text: ele.text });
            }
          });
          setMessages(arr);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    getChats();
  }, []);

  useEffect(() => {
    let messageBox = $(".messages")[0];
    messageBox.scrollTop = messageBox.scrollHeight;
  }, [messages]);

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
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].classList.contains("pin__video")) {
        // console.log($(".unpinned__video"));
        $(".unpinned__video")[0].append(video);
        return;
      }
    }
    videoGrid.append(video);
  };

  const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");

    //adding videostream of the user
    //adding videostream of the user
    call.on("stream", (userVideoStream) => {
      let videos = $("video");
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
          setTimeout(() => {
            $(".unpinned__video").insertAfter($(".pin__video"));
          }, 500);

          return;
        }
      }

      video.addEventListener("click", videoPinHandler);
      addVideoStream(video, userVideoStream);
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
    window.open("about:blank", "_self");
    window.close();
  };

  //on choosing file for chats
  //on choosing file for chats
  const onFileChange = (e) => {
    if (e.target.files[0].size < 4000000) {
      setFile(e.target.files[0]);
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
    // $("#file__input")[0].val(null);
  };

  const onFileCancelUpload = () => {
    $(".main__chat_window").css("marginBottom", "0px");
    $("#file__input").val("");
    setFile(null);
  };

  // ------------------------------------------------------------------------------------------------------------------------
  return (
    <div className="app">
      <div className="header">
        <div className="logo">
          <h4 style={{ color: "white" }}>Designation: XYZ</h4>
          <h3 style={{ color: "white" }}>Mock Interview by Mr/Mrs ABC</h3>
          <h4 style={{ color: "white" }}>Organization: PQR</h4>
          {/* <button onClick={stop}>CLick</button> */}
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
                <div
                  id="stopVideo"
                  className="options__button"
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  <FontAwesomeIcon icon={faVideoSlash} onClick={stopVideo} />
                </div>
              ) : (
                <div id="stopVideo" className="options__button">
                  <FontAwesomeIcon icon={faVideoCamera} onClick={stopVideo} />
                </div>
              )}

              {mute ? (
                <div
                  id="muteButton"
                  className="options__button"
                  onClick={muteHandler}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  <FontAwesomeIcon icon={faMicrophoneAltSlash} />
                </div>
              ) : (
                <div
                  id="muteButton"
                  className="options__button"
                  onClick={muteHandler}
                >
                  <FontAwesomeIcon icon={faMicrophone} />
                </div>
              )}

              {/* <div id="muteButton" className="options__button">
                <FontAwesomeIcon icon={faTabletScreenButton} />
              </div> */}
              <div
                id="exitButton"
                className="options__button"
                style={{ backgroundColor: "red" }}
                onClick={leaveHandler}
              >
                <FontAwesomeIcon
                  icon={faPhoneSlash}
                  style={{ color: "white" }}
                />
              </div>

              {screenShare ? (
                <div
                  id="inviteButton"
                  className="options__button"
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  <StopScreenShareOutlined
                    onClick={() => {
                      setScreenShare(!screenShare);
                    }}
                  />
                </div>
              ) : (
                <div id="inviteButton" className="options__button">
                  <ScreenShareOutlined
                    onClick={() => {
                      setScreenShare(!screenShare);
                    }}
                  />
                </div>
              )}
            </div>
            <div className="options__right">
              {!showMessage && (
                <div id="" className="options__button" onClick={commentHandler}>
                  <FontAwesomeIcon icon={faComment} />
                </div>
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
                  {file.name}
                  <label
                    id="send"
                    className="options__button"
                    onClick={onFileUpload}
                    style={{ backgroundColor: "green", color: "white" }}
                  >
                    <FontAwesomeIcon icon={faFileArrowUp} />
                  </label>
                  <label
                    id="send"
                    className="options__button"
                    onClick={onFileCancelUpload}
                    style={{ backgroundColor: "red", color: "white" }}
                  >
                    <FontAwesomeIcon icon={faFileCircleXmark} />
                  </label>
                </p>
              </div>
            )}
            <input
              id="chat_message"
              type="text"
              autocomplete="off"
              placeholder="Type message here..."
            />
            <div id="send" className="options__button">
              <FontAwesomeIcon icon={faPaperPlane} />
            </div>
            <label id="send" htmlFor="file__input" className="options__button">
              <FontAwesomeIcon icon={faPaperclip} />
            </label>
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
