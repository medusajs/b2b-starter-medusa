"use client"

import React, { useState, useEffect } from "react"
import Modal from "@modules/common/components/modal"
import Button from "@modules/common/components/button"
import { Heading } from "@medusajs/ui"

const WELCOME_MODAL_SHOWN_KEY = "welcomeModalShown"

const WelcomeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check localStorage only on the client-side after mount
    const hasBeenShown = localStorage.getItem(WELCOME_MODAL_SHOWN_KEY)
    if (!hasBeenShown) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(WELCOME_MODAL_SHOWN_KEY, "true")
    setIsOpen(false)
  }

  if (!isOpen) {
    return null // Don't render anything if the modal shouldn't be shown
  }

  return (
    <Modal isOpen={isOpen} close={handleClose} size="small">
      <Modal.Title>
        <Heading level="h2">Welcome!</Heading>
      </Modal.Title>
      <Modal.Body>
        <p className="text-center text-base-regular text-ui-fg-base mb-4">
          We're so happy to have you here. Thanks for visiting our store!
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} data-testid="welcome-modal-no-thanks-button">
          No thank you
        </Button>
        <Button variant="primary" onClick={handleClose} data-testid="welcome-modal-thanks-button">
          Thank you
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default WelcomeModal
