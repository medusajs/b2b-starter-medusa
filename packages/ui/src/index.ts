// Basic components without external dependencies
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/card"

// Simple components
export { Badge } from "./components/badge"
export { Input } from "./components/input"
export { Label } from "./components/label"
export { Skeleton } from "./components/skeleton"

// Icons and branding
export { YshGradientIcon } from "./components/YshGradientIcon"
export { YshLogoMark } from "./components/YshLogoMark"
export { DegradedBanner } from "./components/degraded-banner"

// CSS entrypoints (consumer should import these in their app root)
export const yshThemeCss = "@ysh/ui/styles/theme.css"
export const yshGradientsCss = "@ysh/ui/styles/gradients.css"

