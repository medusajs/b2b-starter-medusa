import { Container, Button, Text } from "@medusajs/ui"

export function Hero() {
  return (
    <Container className="ysh-border-gradient p-6">
      <Text className="bg-gradient-to-r from-[var(--ysh-start)] to-[var(--ysh-end)] bg-clip-text text-transparent text-2xl font-semibold">
        Energia inteligente para todos
      </Text>
      <Button className="mt-4 ysh-border-gradient bg-transparent">Explorar produtos</Button>
    </Container>
  )
}

