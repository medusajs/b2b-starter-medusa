"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Text, Container } from "@medusajs/ui"
import Input from "@/modules/common/components/input"
import Button from "@/modules/common/components/button"
import { SubmitButton } from "@/modules/checkout/components/submit-button"
import ErrorMessage from "@/modules/checkout/components/error-message"
import { changePassword } from "@/lib/data/customer"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const ChangePasswordModal = ({ isOpen, onClose }: Props) => {
  const [message, formAction] = useActionState(changePassword, null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    setIsSuccess(false)
    onClose()
  }

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Container className="max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <Text className="text-2xl font-semibold text-neutral-950 mb-4">
              Password Updated!
            </Text>
            <Text className="text-neutral-600 mb-6">
              Your password has been successfully updated.
            </Text>
            <Button
              onClick={handleClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Container className="max-w-md w-full mx-4 p-6">
        <div className="mb-6">
          <Text className="text-2xl font-semibold text-neutral-950 mb-2">
            Change Password
          </Text>
          <Text className="text-neutral-600">
            Enter your current password and choose a new one.
          </Text>
        </div>

        <form 
          className="w-full" 
          action={formAction}
          onSubmit={() => setIsSuccess(true)}
        >
          <div className="flex flex-col w-full gap-y-4">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              title="Enter your current password"
              autoComplete="current-password"
              required
              data-testid="current-password-input"
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              title="Enter your new password"
              autoComplete="new-password"
              required
              data-testid="new-password-input"
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              title="Confirm your new password"
              autoComplete="new-password"
              required
              data-testid="confirm-password-input"
            />
          </div>
          
          <ErrorMessage error={message} data-testid="change-password-error-message" />
          
          <div className="flex flex-col gap-2 mt-6">
            <SubmitButton data-testid="update-password-button" className="w-full">
              Update Password
            </SubmitButton>
            <Button
              variant="secondary"
              onClick={handleClose}
              className="w-full h-10"
              data-testid="cancel-button"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Container>
    </div>
  )
}

export default ChangePasswordModal
