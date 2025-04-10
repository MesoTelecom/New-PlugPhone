import axios from "axios";

export const apiWP = axios.create({
  baseURL: `https://meso.plugphone.cloud:3333`,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
    //"x-access-token": localStorage.getItem("jwt")
  },
});