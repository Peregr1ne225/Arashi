"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials, redirectUrl?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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

  const logout = useCallback(() => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    setUser(null);
    router.push("/login");
  }, [router]);

  const checkAuth = useCallback(async () => {
    const token = Cookies.get("accessToken");

    try {
      if (!token) {
        setUser(null);
        return;
      }

      const res = await api.get("/auth/profile/");

      if (!res.ok) {
        throw new Error("Unauthorized");
      }

      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed", error);
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials, redirectUrl?: string) => {
    const res = await api.post("/auth/token/", credentials);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Login failed");
    }
    const data = await res.json();

    // Set cookies with 7 days expiry, secure, strict sameSite
    Cookies.set("accessToken", data.access, {
      expires: 7,
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    }); // Stripe redirect back
    Cookies.set("refreshToken", data.refresh, {
      expires: 7,
      secure: window.location.protocol === 'https:',
      sameSite: 'Strict'
    });

    // Fetch user profile immediately after login if not provided in token response
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

  const register = async (data: RegisterData) => {
    const res = await api.post("/auth/register/", data);
    if (!res.ok) {
      const errorData = await res.json();
      throw errorData;
    }
    const responseData = await res.json();
    // Auto login after register
    Cookies.set("accessToken", responseData.access, {
      expires: 7,
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    });
    Cookies.set("refreshToken", responseData.refresh, {
      expires: 7, secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    });
    setUser(responseData.user);

    // Redirect to main page after successful registration
    router.push("/");
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
