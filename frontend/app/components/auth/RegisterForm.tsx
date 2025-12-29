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
              className="block text-sm font-medium text-gray-900"
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
                className={`block w-full px-3 py-2 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors ${
                  errors.username
                    ? "border-b-red-500 focus:border-red-500"
                    : "border-b-gray-300 focus:border-black"
                } ${touched.has("username") && !errors.username ? "border-b-gray-400" : ""}`}
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleFieldChange("username", e.target.value)}
                onBlur={() => handleFieldBlur("username")}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
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
                className={`block w-full px-3 py-2 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors ${
                  errors.email
                    ? "border-b-red-500 focus:border-red-500"
                    : "border-b-gray-300 focus:border-black"
                } ${touched.has("email") && !errors.email ? "border-b-gray-400" : ""}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                onBlur={() => handleFieldBlur("email")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-900"
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
                className={`block w-full px-3 py-2 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors ${
                  errors.firstName
                    ? "border-b-red-500 focus:border-red-500"
                    : "border-b-gray-300 focus:border-black"
                } ${touched.has("firstName") && !errors.firstName ? "border-b-gray-400" : ""}`}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                onBlur={() => handleFieldBlur("firstName")}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-900"
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
                className={`block w-full px-3 py-2 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors ${
                  errors.lastName
                    ? "border-b-red-500 focus:border-red-500"
                    : "border-b-gray-300 focus:border-black"
                } ${touched.has("lastName") && !errors.lastName ? "border-b-gray-400" : ""}`}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                onBlur={() => handleFieldBlur("lastName")}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900"
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
                className={`block w-full px-3 py-2 pr-10 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors ${
                  errors.password
                    ? "border-b-red-500 focus:border-red-500"
                    : "border-b-gray-300 focus:border-black"
                } ${touched.has("password") && !errors.password ? "border-b-gray-400" : ""}`}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={() => handleFieldBlur("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">
                    Password strength
                  </span>
                  {passwordStrength.label && (
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: passwordStrength.color.replace("bg-", ""),
                      }}
                    >
                      {passwordStrength.label}
                    </span>
                  )}
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
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
              className="block text-sm font-medium text-gray-900"
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
                className={`block w-full px-3 py-2 pr-10 border-b-2 bg-transparent focus:outline-none focus:ring-0 transition-colors ${
                  errors.confirmPassword
                    ? "border-b-red-500 focus:border-red-500"
                    : "border-b-gray-300 focus:border-black"
                } ${touched.has("confirmPassword") && !errors.confirmPassword ? "border-b-gray-400" : ""}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleFieldChange("confirmPassword", e.target.value)
                }
                onBlur={() => handleFieldBlur("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
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
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-black py-3 px-4 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-black transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>

      {/* Link to Login */}
      <div className="mt-8 text-center">
        <span className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-black hover:text-gray-800 underline underline-offset-4"
          >
            Sign in
          </Link>
        </span>
      </div>
    </div>
  );
}
