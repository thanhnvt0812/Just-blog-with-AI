/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */
import axios from "axios";
import { BASE_URL } from "./apiPaths";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
//Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
//Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    //handle common errors globally
    if (error.response) {
      if (error.response.status === 401) {
        //redirect to login
        //window.location.href = "/";
      } else if (error.response.status === 500) {
        console.error("Server Error. Please try again later.", error);
      }
    } else if (error.code === "ECONNABORTED")
      console.error("Request timed out. Please try again later.");
    return Promise.reject(error);
  }
);
export default axiosInstance;
