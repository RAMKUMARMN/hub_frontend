import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const API_PATH = "/api/v1";
const normalizeApiBaseUrl = (value: string) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return API_PATH;

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");
  return withoutTrailingSlash.endsWith(API_PATH)
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}${API_PATH}`;
};

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL ?? "");

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const relativePath = normalizedPath.startsWith(API_PATH)
    ? normalizedPath.slice(API_PATH.length)
    : normalizedPath;
  return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // Axios follows redirects but re-sends GET for 307 POST redirects by default.
  // maxRedirects: 0 so we handle trailing-slash 307s at the call site by always
  // including trailing slashes in the URL.
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processRefreshQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
};

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken ||
    (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.method === "get") {
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";
  }
  return config;
});

// Response interceptor — refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${token}`,
              };
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = typeof window !== "undefined"
      ? localStorage.getItem("refresh_token")
      : null;

    if (!refreshToken) {
      isRefreshing = false;
      useAuthStore.getState().logout();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/login")) {
        window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });
      const { access_token, refresh_token: newRefreshToken } = res.data;

      useAuthStore.getState().setTokens(access_token, newRefreshToken ?? refreshToken);
      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${access_token}`,
      };

      processRefreshQueue(null, access_token);
      return api(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(refreshError, null);
      useAuthStore.getState().logout();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/login")) {
        window.location.href = "/auth/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
