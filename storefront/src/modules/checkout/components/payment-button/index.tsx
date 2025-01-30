"use client"

import { isManual, isPaypal, isStripe } from "@lib/constants"
import { createCartApproval, placeOrder } from "@lib/data/cart"
import { getCartApprovalStatus } from "@lib/util/get-cart-approval-status"
import { Container, Text, toast } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import Spinner from "@modules/common/icons/spinner"
import { OnApproveActions, OnApproveData } from "@paypal/paypal-js"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import {
  ApprovalStatusType,
  ApprovalType,
} from "@starter/types/approval/module"
import { useElements, useStripe } from "@stripe/react-stripe-js"
import React, { useMemo, useState } from "react"
import { B2BCart } from "types/global"
import ErrorMessage from "../error-message"
import { redirect } from "next/navigation"
import { removeCartId } from "@lib/data/cookies"

type PaymentButtonProps = {
  cart: B2BCart
  "data-testid": string
}

const completeCart = async (cart: B2BCart) => {
  const response = await placeOrder(cart.id)

  if (response.type === "order") {
    await removeCartId()
    window.location.href = `/${response.order.shipping_address?.country_code?.toLowerCase()}/order/confirmed/${
      response.order.id
    }`
  }

  if (response.type === "cart") {
    throw new Error(response.error.message)
  }
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const requiresApproval =
    cart.company?.approval_settings?.requires_admin_approval ||
    cart.company?.approval_settings?.requires_sales_manager_approval

  const cartApprovalStatus = cart?.approval_status?.status

  // TODO: Add this once gift cards are implemented
  // const paidByGiftcard =
  //   cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // if (paidByGiftcard) {
  //   return <GiftCardPaymentButton />
  // }

  if (requiresApproval && cartApprovalStatus !== ApprovalStatusType.APPROVED) {
    return <RequestApprovalButton cart={cart} notReady={notReady} />
  }

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton
          notReady={notReady}
          data-testid={dataTestId}
          cart={cart}
        />
      )
    case isPaypal(paymentSession?.provider_id):
      return (
        <PayPalPaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

const RequestApprovalButton = ({
  cart,
  notReady,
}: {
  cart: B2BCart
  notReady: boolean
}) => {
  const [submitting, setSubmitting] = useState(false)

  const { requires_admin_approval, requires_sales_manager_approval } =
    cart.company?.approval_settings || {}

  const cartApprovalStatus = cart?.approval_status?.status

  const isPendingAdminApproval =
    cartApprovalStatus === ApprovalStatusType.PENDING

  const createApproval = async () => {
    setSubmitting(true)

    await createCartApproval(cart.id, cart.customer!.id).catch((err) => {
      toast.error(err.message)
    })

    setSubmitting(false)
  }

  return (
    <>
      <Container className="flex flex-col gap-y-2">
        <Text className="text-neutral-700-950 text-xs text-center">
          {requires_admin_approval && requires_sales_manager_approval
            ? "This order requires approval by both a company admin and a sales manager."
            : requires_admin_approval
            ? "This order requires approval by a company admin."
            : "This order requires approval by a sales manager."}
        </Text>
        <Button
          className="w-full h-10 rounded-full shadow-none"
          disabled={notReady || isPendingAdminApproval}
          onClick={createApproval}
          isLoading={submitting}
        >
          {isPendingAdminApproval ? "Approval Requested" : "Request Approval"}
        </Button>
      </Container>
    </>
  )
}

const GiftCardPaymentButton = ({ cart }: { cart: B2BCart }) => {
  const [submitting, setSubmitting] = useState(false)

  const handleOrder = async () => {
    setSubmitting(true)
    await completeCart(cart)
  }

  return (
    <Button
      onClick={handleOrder}
      isLoading={submitting}
      data-testid="submit-order-button"
    >
      Place order
    </Button>
  )
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: B2BCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await completeCart(cart)
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const disabled = !stripe || !elements ? true : false

  const handlePayment = async () => {
    setSubmitting(true)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  return (
    <>
      <Button
        className="w-full"
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const PayPalPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: B2BCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await completeCart(cart)
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  const handlePayment = async (
    _data: OnApproveData,
    actions: OnApproveActions
  ) => {
    actions?.order
      ?.authorize()
      .then((authorization) => {
        if (authorization.status !== "COMPLETED") {
          setErrorMessage(`An error occurred, status: ${authorization.status}`)
          return
        }
        onPaymentCompleted()
      })
      .catch(() => {
        setErrorMessage(`An unknown error occurred, please try again.`)
        setSubmitting(false)
      })
  }

  const [{ isPending, isResolved }] = usePayPalScriptReducer()

  if (isPending) {
    return <Spinner />
  }

  if (isResolved) {
    return (
      <>
        <PayPalButtons
          style={{ layout: "horizontal" }}
          createOrder={async () => session?.data.id as string}
          onApprove={handlePayment}
          disabled={notReady || submitting || isPending}
          data-testid={dataTestId}
        />
        <ErrorMessage
          error={errorMessage}
          data-testid="paypal-payment-error-message"
        />
      </>
    )
  }
}

const ManualTestPaymentButton = ({
  notReady,
  cart,
}: {
  notReady: boolean
  cart: B2BCart
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await completeCart(cart)
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)

    onPaymentCompleted()
  }

  return (
    <>
      <Button
        className="w-full"
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid="submit-order-button"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
