"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Text } from "@medusajs/ui"
import Input from "@/modules/common/components/input"
import Button from "@/modules/common/components/button"
import { SubmitButton } from "@/modules/checkout/components/submit-button"
import ErrorMessage from "@/modules/checkout/components/error-message"
import { forgotPassword } from "@/lib/data/customer"

type Props = {
  setCurrentView: (view: string) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(forgotPassword, null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (isSubmitted) {
    return (
      <div
        className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
        data-testid="forgot-password-success"
      >
        <div className="text-center">
          <Text className="text-4xl text-neutral-950 text-left mb-4">
            Check your email
          </Text>
          <Text className="text-neutral-600 mb-6">
            We've sent you a password reset link. Please check your email and click the link to reset your password.
          </Text>
          <Button
            variant="secondary"
            onClick={() => {
              setIsSubmitted(false)
              setCurrentView("login")
            }}
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
      data-testid="forgot-password-page"
    >
      <div>
        <Text className="text-4xl text-neutral-950 text-left mb-2">
          Forgot your password?
        </Text>
        <Text className="text-neutral-600">
          No worries! Enter your email address and we'll send you a link to reset your password.
        </Text>
      </div>
      
      <form 
        className="w-full" 
        action={formAction}
        onSubmit={() => setIsSubmitted(true)}
      >
        <div className="flex flex-col w-full gap-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter your registered email address"
            autoComplete="email"
            required
            data-testid="email-input"
          />
        </div>
        
        <ErrorMessage error={message} data-testid="forgot-password-error-message" />
        
        <div className="flex flex-col gap-2 mt-6">
          <SubmitButton data-testid="send-reset-button" className="w-full">
            Send Reset Link
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

export default ForgotPassword
