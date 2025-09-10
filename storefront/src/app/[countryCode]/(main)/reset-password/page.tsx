"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Text } from "@medusajs/ui"
import Input from "@/modules/common/components/input"
import Button from "@/modules/common/components/button"
import { SubmitButton } from "@/modules/checkout/components/submit-button"
import ErrorMessage from "@/modules/checkout/components/error-message"
import { resetPassword } from "@/lib/data/customer"
import Image from "next/image"
import { clx } from "@medusajs/ui"

const ResetPasswordContent = () => {
  const [token, setToken] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    setToken(tokenParam)
  }, [searchParams])

  // Password validation function
  const validatePassword = (pwd: string) => {
    const errors: string[] = []
    
    if (pwd.length < 8) {
      errors.push("At least 8 characters")
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

  // Handle form submission manually
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (isSubmitting) {
      return
    }
    
    // Validate before submitting
    if (!token) {
      setErrorMessage("Reset token is missing")
      return
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Please fill in both password fields")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match")
      return
    }

    if (passwordErrors.length > 0) {
      setErrorMessage("Please fix password requirements")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      // Create FormData manually
      const formData = new FormData()
      formData.append("token", token)
      formData.append("password", password)
      formData.append("confirmPassword", confirmPassword)

      // Call the server action directly
      const result = await resetPassword(null, formData)
      
      if (result === null) {
        // Success
        setIsSuccess(true)
      } else {
        // Error
        setErrorMessage(result)
        setIsSubmitting(false)
      }
    } catch (error: any) {
      setErrorMessage("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  // Show invalid token message if no token
  if (!token) {
    return (
      <div className="text-center">
        <Text className="text-4xl text-neutral-950 mb-4">
          Invalid Reset Link
        </Text>
        <Text className="text-neutral-600 mb-6">
          No reset token provided. Please use the link from your email.
        </Text>
        <Button
          variant="secondary"
          onClick={() => router.push("/account")}
          className="w-full h-10"
        >
          Go to Login
        </Button>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <Text className="text-4xl text-neutral-950 mb-4">
          Password Updated!
        </Text>
        <Text className="text-neutral-600 mb-6">
          Your password has been successfully updated. You can now log in with your new password.
        </Text>
        <Button
          onClick={() => router.push("/account")}
          className="w-full h-10"
        >
          Go to Login
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Text className="text-4xl text-neutral-950 mb-2">
        Set New Password
      </Text>
      <Text className="text-neutral-600 mb-6">
        Enter your new password below. Make sure it's secure and easy for you to remember.
      </Text>
      
      <form 
        className="w-full" 
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        {/* Hidden field to prevent autofill */}
        <input 
          type="text" 
          style={{ display: 'none' }} 
          autoComplete="username" 
          aria-hidden="true"
        />
        
        <div className="flex flex-col w-full gap-y-4">
          <div>
            <Input
              label="New Password"
              name="new-password-field"
              type="password"
              title="Enter your new password"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              required
              value={password}
              onChange={(e) => {
                e.preventDefault()
                setPassword(e.target.value)
              }}
              data-testid="new-password-input"
              data-form-type="other"
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
              name="confirm-password-field"
              type="password"
              title="Confirm your new password"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              required
              value={confirmPassword}
              onChange={(e) => {
                e.preventDefault()
                setConfirmPassword(e.target.value)
              }}
              data-testid="confirm-password-input"
              data-form-type="other"
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
        
        <ErrorMessage error={errorMessage} data-testid="reset-password-error-message" />
        
        <div className="flex flex-col gap-2 mt-6">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              passwordErrors.length > 0 || 
              password !== confirmPassword || 
              !password || 
              !confirmPassword
            }
            className={clx(
              "w-full h-10 px-4 rounded-md transition-colors font-medium",
              isSubmitting || passwordErrors.length > 0 || password !== confirmPassword || !password || !confirmPassword
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-neutral-950 text-white hover:bg-neutral-800"
            )}
            data-testid="update-password-button"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/account")}
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

export default function ResetPasswordPage() {
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const image = new window.Image()
    image.src = "/account-block.jpg"
    image.onload = () => {
      setImageLoaded(true)
    }
  }, [])

  return (
    <div className="grid grid-cols-1 small:grid-cols-2 gap-2 m-2 min-h-[80vh]">
      <div className="flex justify-center items-center bg-neutral-100 p-6 small:p-0 h-full">
        <div className="max-w-sm w-full">
          <Suspense fallback={
            <div className="text-center">
              <Text className="text-4xl text-neutral-950 mb-4">
                Loading...
              </Text>
            </div>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>

      <div className="relative">
        <Image
          src="/account-block.jpg"
          alt="Login banner background"
          className={clx(
            "object-cover transition-opacity duration-300 w-full h-full",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          fill
          quality={100}
          priority
        />
      </div>
    </div>
  )
}