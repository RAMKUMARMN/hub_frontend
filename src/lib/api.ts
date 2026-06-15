import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  // Axios follows redirects but re-sends GET for 307 POST redirects by default.
  // maxRedirects: 0 so we handle trailing-slash 307s at the call site by always
  // including trailing slashes in the URL.
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
    ?? (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequestConfig | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshToken = typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token } = res.data;
          // Update token in Zustand store
          useAuthStore.getState().setTokens(access_token, refreshToken);
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch {
          // Refresh failed — clear tokens and redirect to login
          useAuthStore.getState().logout();
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      } else {
        // No refresh token at all — send to login
        useAuthStore.getState().logout();
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
