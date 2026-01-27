import axios from "axios";

export const api = axios.create({
  //baseURL: `https://lab.whatsapp.plugphone.cloud:4444`, 
baseURL: `https://meso.plugphone.cloud:1339`,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    //"x-access-token": localStorage.getItem("jwt")
  },
});