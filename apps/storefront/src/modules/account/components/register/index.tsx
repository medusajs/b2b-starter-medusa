"use client"

import { useFormState } from "react-dom"

import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { Label, Switch, Text } from "@medusajs/ui"
import { useState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [isBusiness, setIsBusiness] = useState(false)
  const [message, formAction] = useFormState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Become a Medusa B2B Store Member
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Create your Medusa Store Member profile, and register your company to
        invite your team.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="First name"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
          <div className="flex items-center gap-x-2">
            <Switch onCheckedChange={setIsBusiness} />
            <Text className="text-ui-fg-base text-base!">Business account</Text>
          </div>
          {isBusiness && (
            <>
              <input
                type="hidden"
                name="is_business"
                value={isBusiness.toString()}
              />
              <Input
                label="Company name"
                name="company_name"
                required
                autoComplete="organization"
                data-testid="company-name-input"
              />
              <Input
                label="Company email"
                name="company_email"
                required
                type="email"
                autoComplete="email"
                data-testid="company-email-input"
              />
              <Input
                label="Company phone"
                name="company_phone"
                required
                type="tel"
                autoComplete="tel"
                data-testid="company-phone-input"
              />
              <Input
                label="Company address"
                name="company_address"
                required
                autoComplete="address"
                data-testid="company-address-input"
              />
              <Input
                label="Company city"
                name="company_city"
                required
                autoComplete="city"
                data-testid="company-city-input"
              />
              <Input
                label="Company state"
                name="company_state"
                required
                autoComplete="state"
                data-testid="company-state-input"
              />
              <Input
                label="Company zip"
                name="company_zip"
                required
                autoComplete="postal-code"
                data-testid="company-zip-input"
              />
              <Input
                label="Company country"
                name="company_country"
                required
                autoComplete="country"
                data-testid="company-country-input"
              />
              <Input
                label="Currency"
                name="currency_code"
                required
                autoComplete="currency"
                data-testid="company-currency-input"
              />
            </>
          )}
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to Medusa B2B Store&apos;s{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Join
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
