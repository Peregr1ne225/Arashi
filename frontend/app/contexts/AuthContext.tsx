"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any, redirectUrl?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get("accessToken");
    if (token) {
      try {
        const res = await api.get("/auth/profile/");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Auth check failed", error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials: any, redirectUrl?: string) => {
    const res = await api.post("/auth/token/", credentials);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Login failed");
    }
    const data = await res.json();

    // Set cookies with 7 days expiry, secure, strict sameSite
    Cookies.set("accessToken", data.access, { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' });
    Cookies.set("refreshToken", data.refresh, { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' });

    // Fetch user profile immediately after login if not provided in token response
    // The current backend view returns { access, refresh, user } so we can use that
    if (data.user) {
      setUser(data.user);
    } else {
      await checkAuth();
    }

    // Use provided redirect URL, or get from query parameters, or default to home
    let finalRedirectUrl = redirectUrl || "/";

    // If no redirect URL provided, check query parameters
    if (!redirectUrl && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryRedirectUrl = urlParams.get("redirect");
      finalRedirectUrl = queryRedirectUrl || "/";
    }

    router.push(finalRedirectUrl);
  };

  const register = async (data: any) => {
    const res = await api.post("/auth/register/", data);
    if (!res.ok) {
      const errorData = await res.json();
      // Format errors into a string or object
      let errorMessage = "Registration failed";
      if (typeof errorData === "object") {
        errorMessage = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ");
      }
      throw new Error(errorMessage);
    }
    const responseData = await res.json();
    // Auto login after register
    Cookies.set("accessToken", responseData.access, { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' });
    Cookies.set("refreshToken", responseData.refresh, { expires: 7, secure: window.location.protocol === 'https:', sameSite: 'Strict' });
    setUser(responseData.user);

    // Redirect to main page after successful registration
    router.push("/");
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setUser(null);
    router.push("/login");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
