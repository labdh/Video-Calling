import React, { useEffect, useState } from "react";
import axios from "axios";
import $ from "jquery"
import { socket,peer } from "../pages/utils";


const Timer = ({BASE_URL,ROOM_ID}) => {

  const [seconds,setSeconds] = useState(0);
  const [arr,setArr] = useState([0,0,0]);
  let userInterval;
  let sec;
  

    useEffect(()=>{

      sec = $("span")

      axios
      .get(`${BASE_URL}/timer/${ROOM_ID}`)
      .then((res) => {
        const t = res.data.seconds;
        if(t){
          setSeconds(res.data.seconds)
        }
      });

      peer.on("call",(call)=>{
        if(call.metadata.split("/")[1]!=="screen-share"){
        userInterval = setInterval(()=>{
          setSeconds(prev=>{

            let hours = Math.trunc(prev/3600);
            let minutes = Math.trunc(prev/60);
            let seconds = prev - (hours*3600 + minutes*60);

            setArr([hours,minutes,seconds]);

            return prev+1
          });
        },1000);
      }
      })
  
  
          socket.on("user-connected",(recieverId)=>{
            if(!userInterval){
            userInterval = setInterval(()=>{
              setSeconds(prev=>{

                let hours = Math.trunc(prev/3600);
                let minutes = Math.trunc(prev/60);
                let seconds = prev - (hours*3600 + minutes*60);
    
                setArr([hours,minutes,seconds]);

                return prev+1;
              });
            },1000);
          }
              socket.removeListener("user-connected");
          })
  
          socket.on("disconnected",(deleteId, name = "")=>{
  
          if(!name){
  
          clearInterval(userInterval);
          userInterval=null;
  
          axios.post(`${BASE_URL}/${ROOM_ID}/timer`,{seconds:Number(sec.attr('name'))})
  
            socket.removeListener("disconnected");
          }
        }
          )

    },[])

      

  return (
    <div style={{ fontSize: "18px", color: "white" }}>
    <span name={seconds}>{arr[0]}:{arr[1]}:{arr[2]}</span>
    {/* <span>{seconds}</span> */}
  </div>
  )
}

export default Timer