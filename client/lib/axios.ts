import axios from "axios";

const axiosIns = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

export { axiosIns };
