// src/utils/api.js
import axios from "axios";
import { getAuth } from "firebase/auth";

const BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add Firebase ID Token automatically.
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdToken();

        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // IMPORTANT:
      // Never force application/json for FormData.
      // The browser/Axios must create the multipart boundary.
      if (
        typeof FormData !== "undefined" &&
        config.data instanceof FormData
      ) {
        if (config.headers) {
          delete config.headers["Content-Type"];
          delete config.headers["content-type"];
        }
      }
    } catch (error) {
      console.error("❌ Failed to prepare API request:", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default api;
