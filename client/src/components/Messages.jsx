import React from "react";
import "./Messages.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

export const PeerMessages = ({ name, text, url = "" }) => {
  // console.log(url);
  let filename = "";
  if (url) {
    filename = url.split("/");
    filename = filename[filename.length - 1];
  }

  return (
    <div className="peer__messages">
      <p className="message__name">{name}</p>
      {url ? (
        <a className="message__text" href={url} target="_blank">
          <FontAwesomeIcon icon={faDownload} className="download__button" />
          {filename}
        </a>
      ) : (
        <p className="message__text">{text}</p>
      )}
    </div>
  );
};

export const OwnerMessages = ({ name, url = "", text }) => {
  // console.log(url);
  let filename = "";
  if (url) {
    filename = url.split("/");
    filename = filename[filename.length - 1];
  }

  return (
    <div className="owner__messages">
      <p className="message__name">{name}</p>
      {url ? (
        <a className="message__text" href={url} target="_blank">
          <FontAwesomeIcon icon={faDownload} className="download__button" />
          {filename}
        </a>
      ) : (
        <p className="message__text">{text}</p>
      )}
    </div>
  );
};
