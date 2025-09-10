"use client"

import { useState, useEffect, Suspense } from "react"
import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { Text } from "@medusajs/ui"
import Input from "@/modules/common/components/input"
import Button from "@/modules/common/components/button"
import { SubmitButton } from "@/modules/checkout/components/submit-button"
import ErrorMessage from "@/modules/checkout/components/error-message"
import { resetPassword } from "@/lib/data/customer"

type Props = {
  setCurrentView: (view: string) => void
}

const ResetPasswordContent = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(resetPassword, null)
  const [token, setToken] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
  const searchParams = useSearchParams()

  // Client-side token validation function
  const validateToken = (tokenString: string): boolean => {
    try {
      console.log("🔍 [TokenValidation] Validating token:", tokenString.substring(0, 50) + "...");
      
      const tokenParts = tokenString.split('.');
      if (tokenParts.length !== 3) {
        console.log("❌ [TokenValidation] Invalid token format - not 3 parts");
        return false;
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log("🔍 [TokenValidation] Token payload:", payload);
      
      const currentTime = Math.floor(Date.now() / 1000);
      console.log("🔍 [TokenValidation] Current time:", currentTime);
      console.log("🔍 [TokenValidation] Token expires at:", payload.exp);
      
      // Check if token is expired
      if (payload.exp && payload.exp < currentTime) {
        console.log("❌ [TokenValidation] Token is expired");
        return false;
      }
      
      // Check if token has basic required fields (less strict)
      if (!payload.entity_id && !payload.sub) {
        console.log("❌ [TokenValidation] Token missing entity_id or sub");
        return false;
      }
      
      console.log("✅ [TokenValidation] Token is valid");
      return true;
    } catch (error) {
      console.error("❌ [TokenValidation] Error validating token:", error);
      return false;
    }
  }

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    console.log("🚨🚨🚨 TOKEN FROM URL:", tokenParam);
    setToken(tokenParam)
    
    // Validate token format and expiration
    if (tokenParam) {
      const isValid = validateToken(tokenParam);
      console.log("🔍 [TokenValidation] Token validation result:", isValid);
      setIsTokenValid(isValid);
    } else {
      setIsTokenValid(false);
    }
  }, [searchParams])

  // Handle form submission results
  useEffect(() => {
    if (hasSubmitted) {
      if (message === null) {
        // No error message means success
        setIsSuccess(true)
      } else {
        // There's an error message - check if it's a token-related error
        if (message.includes("Invalid") || message.includes("expired") || message.includes("token")) {
          setIsTokenValid(false)
        }
      }
    }
  }, [message, hasSubmitted])

  // Password validation function
  const validatePassword = (pwd: string) => {
    const errors: string[] = []
    
    if (pwd.length < 8) {
      errors.push("At least 8 characters")
    }
    
    if (pwd.length > 128) {
      errors.push("No more than 128 characters")
    }
    
    if (!/[A-Z]/.test(pwd)) {
      errors.push("One uppercase letter")
    }
    
    if (!/[a-z]/.test(pwd)) {
      errors.push("One lowercase letter")
    }
    
    if (!/\d/.test(pwd)) {
      errors.push("One number")
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push("One special character")
    }
    
    return errors
  }

  // Validate password on change
  useEffect(() => {
    if (password) {
      setPasswordErrors(validatePassword(password))
    } else {
      setPasswordErrors([])
    }
  }, [password])

  // Show invalid token message only if no token at all
  if (!token) {
    return (
      <div
        className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
        data-testid="reset-password-invalid"
      >
        <div className="text-center">
          <Text className="text-4xl text-neutral-950 text-left mb-4">
            Invalid Reset Link
          </Text>
          <Text className="text-neutral-600 mb-6">
            {!token 
              ? "No reset token provided. Please use the link from your email."
              : "This password reset link is invalid or has expired. Please request a new one."
            }
          </Text>
          {message && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <Text className="text-red-600 text-sm">
                {message}
              </Text>
            </div>
          )}
          <Button
            variant="secondary"
            onClick={() => setCurrentView("forgot-password")}
            className="w-full h-10"
          >
            Request New Link
          </Button>
        </div>
      </div>
    )
  }

  // Show loading state while validating token
  if (isTokenValid === null) {
    return (
      <div
        className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
        data-testid="reset-password-loading"
      >
        <div className="text-center">
          <Text className="text-4xl text-neutral-950 text-left mb-4">
            Validating Reset Link...
          </Text>
          <Text className="text-neutral-600">
            Please wait while we verify your reset link.
          </Text>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div
        className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
        data-testid="reset-password-success"
      >
        <div className="text-center">
          <Text className="text-4xl text-neutral-950 text-left mb-4">
            Password Updated!
          </Text>
          <Text className="text-neutral-600 mb-6">
            Your password has been successfully updated. You can now log in with your new password.
          </Text>
          <Button
            variant="secondary"
            onClick={() => setCurrentView("login")}
            className="w-full h-10"
          >
            Back to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
      data-testid="reset-password-page"
    >
      <div>
        <Text className="text-4xl text-neutral-950 text-left mb-2">
          Set new password
        </Text>
        <Text className="text-neutral-600">
          Enter your new password below. Make sure it's secure and easy for you to remember.
        </Text>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Token: {token ? "Present" : "Missing"}</p>
            <p>Token Valid: {isTokenValid === null ? "Checking..." : isTokenValid ? "Yes" : "No"}</p>
          </div>
        )}
      </div>
      
      <form 
        className="w-full" 
        action={formAction}
        onSubmit={(e) => {
          console.log("🚨🚨🚨 FORM SUBMITTED! 🚨🚨🚨");
          setHasSubmitted(true)
          // Don't prevent default - let the form submit normally
        }}
      >
        <input type="hidden" name="token" value={token} />
        
        <div className="flex flex-col w-full gap-y-4">
          <div>
            <Input
              label="New Password"
              name="password"
              type="password"
              title="Enter your new password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="new-password-input"
            />
            {password && passwordErrors.length > 0 && (
              <div className="mt-2 text-sm text-red-600">
                <p className="font-medium">Password must contain:</p>
                <ul className="list-disc list-inside mt-1">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {password && passwordErrors.length === 0 && (
              <div className="mt-2 text-sm text-green-600">
                ✅ Password meets all requirements
              </div>
            )}
          </div>
          
          <div>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              title="Confirm your new password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-testid="confirm-password-input"
            />
            {confirmPassword && password !== confirmPassword && (
              <div className="mt-2 text-sm text-red-600">
                ❌ Passwords do not match
              </div>
            )}
            {confirmPassword && password === confirmPassword && password && (
              <div className="mt-2 text-sm text-green-600">
                ✅ Passwords match
              </div>
            )}
          </div>
        </div>
        
        <ErrorMessage error={message} data-testid="reset-password-error-message" />
        
        <div className="flex flex-col gap-2 mt-6">
          <SubmitButton 
            data-testid="update-password-button" 
            className="w-full"
            disabled={
              passwordErrors.length > 0 || 
              password !== confirmPassword || 
              !password || 
              !confirmPassword
            }
            onClick={() => {
              console.log("🚨🚨🚨 SUBMIT BUTTON CLICKED! 🚨🚨🚨");
              console.log("🔑 [SubmitButton] Token:", token ? "present" : "missing");
            }}
          >
            Update Password
          </SubmitButton>
          <Button
            variant="secondary"
            onClick={() => setCurrentView("login")}
            className="w-full h-10"
            data-testid="back-to-login-button"
          >
            Back to Login
          </Button>
        </div>
      </form>
    </div>
  )
}

const ResetPassword = ({ setCurrentView }: Props) => {
  return (
    <Suspense fallback={
      <div
        className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
        data-testid="reset-password-loading"
      >
        <div className="text-center">
          <Text className="text-4xl text-neutral-950 text-left mb-4">
            Loading...
          </Text>
        </div>
      </div>
    }>
      <ResetPasswordContent setCurrentView={setCurrentView} />
    </Suspense>
  )
}

export default ResetPassword
