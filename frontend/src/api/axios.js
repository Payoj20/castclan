import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

//Automatically attach JWT token to every req
client.interceptors.request.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      if (!window.location.pathname.match(/^\/(login|signup)?$/)) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  },
);

export default client;
