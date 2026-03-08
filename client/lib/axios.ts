import axios from "axios";

axios.defaults.baseURL = process.env.SERVER_URL || "http://localhost:8000";
axios.defaults.withCredentials = true;

export default axios;
