import axios from "axios";
import { store } from "../store";
import { clearAuth } from "../store/slices/authSlice";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      store.dispatch(clearAuth());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
