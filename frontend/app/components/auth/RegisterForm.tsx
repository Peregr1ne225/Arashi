"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

interface RegisterFormProps {
  onSuccess?: () => void;
}

interface FormErrors {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  width: string;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Validation functions
  const validateUsername = (value: string): string | undefined => {
    if (!value) return "Username is required";
    // Alphanumeric only, must start with a letter
    const regex = /^[a-zA-Z][a-zA-Z0-9]*$/;
    if (!regex.test(value)) {
      return "Username must start with a letter and contain only letters and numbers";
    }
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 30) return "Username must not exceed 30 characters";
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return undefined;
  };

  const validateFirstName = (value: string): string | undefined => {
    if (!value) return "First name is required";
    if (value.length < 1) return "First name is required";
    if (value.length > 50) return "First name must not exceed 50 characters";
    return undefined;
  };

  const validateLastName = (value: string): string | undefined => {
    if (!value) return "Last name is required";
    if (value.length < 1) return "Last name is required";
    if (value.length > 50) return "Last name must not exceed 50 characters";
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[a-zA-Z]/.test(value))
      return "Password must contain at least one letter";
    if (!/\d/.test(value)) return "Password must contain at least one number";
    return undefined;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string,
  ): string | undefined => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return undefined;
  };

  // Password strength calculator
  const getPasswordStrength = (value: string): PasswordStrength => {
    if (!value) {
      return { score: 0, label: "", color: "", width: "0%" };
    }

    let score = 0;

    // Length check
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;

    // Complexity checks
    if (/[a-z]/.test(value)) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^a-zA-Z0-9]/.test(value)) score += 1;

    if (score <= 2) {
      return { score, label: "Weak", color: "bg-red-500", width: "33%" };
    } else if (score <= 4) {
      return { score, label: "Medium", color: "bg-yellow-500", width: "66%" };
    } else {
      return { score, label: "Strong", color: "bg-green-500", width: "100%" };
    }
  };

  // Field change handler
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation for touched fields
    if (touched.has(field)) {
      const newErrors = { ...errors };
      switch (field) {
        case "username":
          newErrors.username = validateUsername(value);
          break;
        case "email":
          newErrors.email = validateEmail(value);
          break;
        case "firstName":
          newErrors.firstName = validateFirstName(value);
          break;
        case "lastName":
          newErrors.lastName = validateLastName(value);
          break;
        case "password":
          newErrors.password = validatePassword(value);
          if (formData.confirmPassword) {
            newErrors.confirmPassword = validateConfirmPassword(
              value,
              formData.confirmPassword,
            );
          }
          break;
        case "confirmPassword":
          newErrors.confirmPassword = validateConfirmPassword(
            formData.password,
            value,
          );
          break;
      }
      setErrors(newErrors);
    }
  };

  // Field blur handler
  const handleFieldBlur = (field: keyof typeof formData) => {
    setTouched((prev) => new Set([...prev, field]));
    const newErrors = { ...errors };
    const value = formData[field];

    switch (field) {
      case "username":
        newErrors.username = validateUsername(value);
        break;
      case "email":
        newErrors.email = validateEmail(value);
        break;
      case "firstName":
        newErrors.firstName = validateFirstName(value);
        break;
      case "lastName":
        newErrors.lastName = validateLastName(value);
        break;
      case "password":
        newErrors.password = validatePassword(value);
        if (formData.confirmPassword) {
          newErrors.confirmPassword = validateConfirmPassword(
            value,
            formData.confirmPassword,
          );
        }
        break;
      case "confirmPassword":
        newErrors.confirmPassword = validateConfirmPassword(
          formData.password,
          value,
        );
        break;
    }
    setErrors(newErrors);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      firstName: validateFirstName(formData.firstName),
      lastName: validateLastName(formData.lastName),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.password,
        formData.confirmPassword,
      ),
    };

    setErrors(newErrors);
    setTouched(
      new Set([
        "username",
        "email",
        "firstName",
        "lastName",
        "password",
        "confirmPassword",
      ]),
    );

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(
      (error) => error !== undefined,
    );
    if (hasErrors) {
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      // Handle backend errors
      const errorMap: FormErrors = {};

      // If it's a structured validation error object from backend (often returning Record<string, string[]>)
      if (
        typeof err === "object" &&
        err !== null &&
        !("message" in err && err instanceof Error)
      ) {
        // Assertion for looser typing on the error object to access potential fields safely
        const errorObj = err as Record<string, string | string[]>;

        if (errorObj.username) {
          errorMap.username = Array.isArray(errorObj.username)
            ? errorObj.username[0]
            : errorObj.username;
        }
        if (errorObj.email) {
          errorMap.email = Array.isArray(errorObj.email)
            ? errorObj.email[0]
            : errorObj.email;
        }

        // Handle other standard DRF errors
        if (errorObj.detail) {
          errorMap.username = Array.isArray(errorObj.detail)
            ? errorObj.detail[0]
            : errorObj.detail;
        } else if (Object.keys(errorMap).length === 0) {
          // If we have an object but no known fields, try to show something
          errorMap.username = "Registration failed. Please check your details.";
        }
      } else if (err instanceof Error) {
        // Fallback for network errors or other JS exceptions
        errorMap.username = err.message;
      } else {
        errorMap.username = "An unexpected error occurred.";
      }

      setErrors(errorMap);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="font-koulen text-[48px] md:text-[64px] leading-tight text-[#0e4d80] mb-2 uppercase tracking-tighter">
          Register
        </h1>
        <p className="font-body text-sm text-gray-400 max-w-xs mx-auto">
          One account for all your gear. Join the high-speed movement today.
        </p>
      </div>

      <form
        className="w-full space-y-6 flex flex-col items-center px-4"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4 w-full max-w-sm">
          {/* Username */}
          <div className="relative group">
            <div className="absolute h-14 left-5 flex items-center pointer-events-none">
              <span className="text-gray-300 font-koulen text-xs uppercase tracking-widest">User</span>
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="block w-full h-14 pl-16 pr-6 rounded-full bg-gray-50 border border-gray-100 focus:border-[#0e4d80] focus:bg-white text-base font-body font-normal text-black focus:outline-none placeholder-gray-300 transition-all shadow-sm"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => handleFieldChange("username", e.target.value)}
              onBlur={() => handleFieldBlur("username")}
            />
            {errors.username && (
              <p className="mt-1 text-[10px] text-red-500 font-bold uppercase tracking-widest pl-5">
                {errors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="relative group">
            <div className="absolute h-14 left-5 flex items-center pointer-events-none">
              <span className="text-gray-300 font-koulen text-xs uppercase tracking-widest">Email</span>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full h-14 pl-16 pr-6 rounded-full bg-gray-50 border border-gray-100 focus:border-[#0e4d80] focus:bg-white text-base font-body font-normal text-black focus:outline-none placeholder-gray-300 transition-all shadow-sm"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => handleFieldBlur("email")}
            />
            {errors.email && (
              <p className="mt-1 text-[10px] text-red-500 font-bold uppercase tracking-widest pl-5">
                {errors.email}
              </p>
            )}
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <div className="absolute h-14 left-5 flex items-center pointer-events-none">
                <span className="text-gray-200 font-koulen text-[10px] uppercase tracking-widest">First</span>
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="block w-full h-14 pl-14 pr-4 rounded-full bg-gray-50 border border-gray-100 focus:border-[#0e4d80] focus:bg-white text-base font-body font-normal text-black focus:outline-none placeholder-gray-300 transition-all shadow-sm"
                placeholder="Name"
                value={formData.firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                onBlur={() => handleFieldBlur("firstName")}
              />
              {errors.firstName && (
                <p className="mt-1 text-[10px] text-red-500 font-bold uppercase tracking-widest pl-5">
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="relative group">
              <div className="absolute h-14 left-5 flex items-center pointer-events-none">
                <span className="text-gray-200 font-koulen text-[10px] uppercase tracking-widest">Last</span>
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="block w-full h-14 pl-14 pr-4 rounded-full bg-gray-50 border border-gray-100 focus:border-[#0e4d80] focus:bg-white text-base font-body font-normal text-black focus:outline-none placeholder-gray-300 transition-all shadow-sm"
                placeholder="Name"
                value={formData.lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                onBlur={() => handleFieldBlur("lastName")}
              />
              {errors.lastName && (
                <p className="mt-1 text-[10px] text-red-500 font-bold uppercase tracking-widest pl-5">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="relative group">
            <div className="relative">
              <div className="absolute h-14 left-5 flex items-center pointer-events-none">
                <span className="text-gray-300 font-koulen text-xs uppercase tracking-widest">Pass</span>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="block w-full h-14 pl-16 pr-12 rounded-full bg-gray-50 border border-gray-100 focus:border-[#0e4d80] focus:bg-white text-base font-body font-normal text-black focus:outline-none placeholder-gray-300 transition-all shadow-sm"
                placeholder="********"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={() => handleFieldBlur("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#0e4d80] focus:outline-none transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[10px] text-red-500 font-bold uppercase tracking-widest pl-5">
                {errors.password}
              </p>
            )}

            {/* Password Strength Meter - Simplified */}
            {formData.password && (
              <div className="mt-2 w-full px-4">
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${passwordStrength.color}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative group">
            <div className="relative">
              <div className="absolute h-14 left-5 flex items-center pointer-events-none">
                <span className="text-gray-300 font-koulen text-xs uppercase tracking-widest">Confirm</span>
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="block w-full h-14 pl-24 pr-12 rounded-full bg-gray-50 border border-gray-100 focus:border-[#0e4d80] focus:bg-white text-base font-body font-normal text-black focus:outline-none placeholder-gray-300 transition-all shadow-sm"
                placeholder="********"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleFieldChange("confirmPassword", e.target.value)
                }
                onBlur={() => handleFieldBlur("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#0e4d80] focus:outline-none transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-[10px] text-red-500 font-bold uppercase tracking-widest pl-5">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-64 h-14 rounded-full bg-[#0e4d80] text-white font-koulen text-[18px] uppercase tracking-widest hover:bg-[#0a3a60] hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
          >
            {loading ? "Creating..." : "Start Journey"}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="font-body text-xs text-gray-400 uppercase tracking-widest">
          Already have an account?&nbsp;
          <Link
            href="/login"
            className="font-bold text-[#0e4d80] hover:text-[#0a3a60] transition-colors underline decoration-1 underline-offset-4 cursor-pointer"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
