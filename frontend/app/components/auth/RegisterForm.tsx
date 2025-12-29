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
      if (err instanceof Error) {
        // Parse backend error messages
        const errorMap: FormErrors = {};
        const errorString = err.message;

        if (errorString.includes("username")) {
          errorMap.username = errorString;
        } else if (errorString.includes("email")) {
          errorMap.email = errorString;
        } else {
          // General error
          errorMap.username = errorString;
        }

        setErrors(errorMap);
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="w-full">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1"
            >
              Username
            </label>
            <div className="mt-1 relative">
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className={`block w-full bg-black/50 border-2 text-white placeholder-gray-600 px-4 py-3 font-bold uppercase tracking-wider outline-none transition-all duration-300 skew-box ${errors.username
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-accent"
                  } ${touched.has("username") && !errors.username ? "border-green-500/50" : ""}`}
                placeholder="CHOOSE USERNAME"
                value={formData.username}
                onChange={(e) => handleFieldChange("username", e.target.value)}
                onBlur={() => handleFieldBlur("username")}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-red-500 font-bold uppercase tracking-wide">{errors.username}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1"
            >
              Email
            </label>
            <div className="mt-1 relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={`block w-full bg-black/50 border-2 text-white placeholder-gray-600 px-4 py-3 font-bold uppercase tracking-wider outline-none transition-all duration-300 skew-box ${errors.email
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-accent"
                  } ${touched.has("email") && !errors.email ? "border-green-500/50" : ""}`}
                placeholder="ENTER EMAIL"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={() => handleFieldBlur("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 font-bold uppercase tracking-wide">{errors.email}</p>
              )}
            </div>
          </div>

          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1"
            >
              First Name
            </label>
            <div className="mt-1 relative">
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                className={`block w-full bg-black/50 border-2 text-white placeholder-gray-600 px-4 py-3 font-bold uppercase tracking-wider outline-none transition-all duration-300 skew-box ${errors.firstName
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-accent"
                  } ${touched.has("firstName") && !errors.firstName ? "border-green-500/50" : ""}`}
                placeholder="FIRST NAME"
                value={formData.firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                onBlur={() => handleFieldBlur("firstName")}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500 font-bold uppercase tracking-wide">{errors.firstName}</p>
              )}
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1"
            >
              Last Name
            </label>
            <div className="mt-1 relative">
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                className={`block w-full bg-black/50 border-2 text-white placeholder-gray-600 px-4 py-3 font-bold uppercase tracking-wider outline-none transition-all duration-300 skew-box ${errors.lastName
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-accent"
                  } ${touched.has("lastName") && !errors.lastName ? "border-green-500/50" : ""}`}
                placeholder="LAST NAME"
                value={formData.lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                onBlur={() => handleFieldBlur("lastName")}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500 font-bold uppercase tracking-wide">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1"
            >
              Password
            </label>
            <div className="mt-1 relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                className={`block w-full bg-black/50 border-2 text-white placeholder-gray-600 px-4 py-3 font-bold uppercase tracking-wider outline-none transition-all duration-300 skew-box ${errors.password
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-accent"
                  } ${touched.has("password") && !errors.password ? "border-green-500/50" : ""}`}
                placeholder="CREATE PASSWORD"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={() => handleFieldBlur("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-4 text-gray-400 hover:text-white focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 font-bold uppercase tracking-wide">{errors.password}</p>
              )}
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Strength
                  </span>
                  {passwordStrength.label && (
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{
                        color: passwordStrength.label === "Strong" ? "#ccff00" : passwordStrength.color.replace("bg-", ""),
                      }}
                    >
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
                <div className="h-1 w-full bg-white/10 overflow-hidden transform skew-x-[-20deg]">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1"
            >
              Confirm Password
            </label>
            <div className="mt-1 relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                className={`block w-full bg-black/50 border-2 text-white placeholder-gray-600 px-4 py-3 font-bold uppercase tracking-wider outline-none transition-all duration-300 skew-box ${errors.confirmPassword
                  ? "border-red-500 focus:border-red-500"
                  : "border-transparent focus:border-accent"
                  } ${touched.has("confirmPassword") && !errors.confirmPassword ? "border-green-500/50" : ""}`}
                placeholder="CONFIRM PASSWORD"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleFieldChange("confirmPassword", e.target.value)
                }
                onBlur={() => handleFieldBlur("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-4 text-gray-400 hover:text-white focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500 font-bold uppercase tracking-wide">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                JOINING TEAM...
              </span>
            ) : (
              "CREATE ACCOUNT //"
            )}
          </button>
        </div>
      </form>

      {/* Link to Login */}
      <div className="mt-8 text-center border-t border-white/10 pt-6">
        <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">
          Already on the roster?{" "}
          <Link
            href="/login"
            className="font-bold text-accent hover:text-white uppercase tracking-wider transition-colors ml-1"
          >
            Sign in
          </Link>
        </span>
      </div>
    </div>
  );
}
