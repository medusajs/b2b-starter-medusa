import { Text } from "@medusajs/ui"

export default function Footer() {
  return (
    <footer className="border-t border-ui-border-base w-full bg-white">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-10 md:py-14 gap-y-6 md:gap-y-0">
          <div className="max-w-xl">
            <h2 className="font-bold text-lg md:text-xl text-ui-fg-base mb-1 tracking-tight">Batteries N&apos; Things</h2>
            <p className="text-ui-fg-subtle text-sm md:text-base">Batteries N&apos; Things provide premium technology products at the best prices in the country.</p>
          </div>
          <div className="md:text-right">
            <h3 className="font-bold text-base text-ui-fg-base mb-1">Contact Us</h3>
            <p className="text-ui-fg-subtle text-sm md:text-base">2800 John Street Unit 5, Markham, Ontario, L3R 0E2, Canada</p>
            <p className="text-ui-fg-subtle text-sm md:text-base">Email: info@bntbng.com</p>
            <p className="text-ui-fg-subtle text-sm md:text-base">Phone: 416-368-0023</p>
          </div>
        </div>
        <div className="flex w-full mb-8 md:mb-4 justify-between text-ui-fg-muted border-t border-ui-border-base pt-4">
          <Text className="txt-compact-small">
            © 2025 Batteries N&apos; Things. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
