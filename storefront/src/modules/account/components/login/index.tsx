import { login } from "@/lib/data/customer"
import { LOGIN_VIEW } from "@/modules/account/templates/login-template"
import ErrorMessage from "@/modules/checkout/components/error-message"
import { SubmitButton } from "@/modules/checkout/components/submit-button"
import Button from "@/modules/common/components/button"
import Input from "@/modules/common/components/input"
import { Checkbox, Text } from "@medusajs/ui"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="max-w-sm w-full h-full flex flex-col justify-center gap-6 my-auto"
      data-testid="login-page"
    >
      <Text className="text-4xl text-neutral-950 text-left">
        Log in for faster
        <br />
        checkout.
      </Text>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
          <div className="flex flex-col gap-2 w-full border-b border-neutral-200 my-6" />
          <div className="flex items-center gap-2">
            <Checkbox name="remember_me" data-testid="remember-me-checkbox" />
            <Text className="text-neutral-950 text-base-regular">
              Remember me
            </Text>
          </div>
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <div className="flex flex-col gap-2">
          <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
            Log in
          </SubmitButton>
          <Button
            variant="secondary"
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="w-full h-10"
            data-testid="register-button"
          >
            Register
          </Button>
        </div>
      </form>
    </div>
  )
}

export default Login
