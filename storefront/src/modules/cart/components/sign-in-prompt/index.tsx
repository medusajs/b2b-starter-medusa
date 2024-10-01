import { Button, Container, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <Container className="flex items-center justify-between self-stretch">
      <div>
        <Heading level="h2" className="txt-xlarge">
          Already have an account?
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          Sign in for a better experience.
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button
            variant="secondary"
            className="h-10 rounded-full"
            data-testid="sign-in-button"
          >
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </Container>
  )
}

export default SignInPrompt
