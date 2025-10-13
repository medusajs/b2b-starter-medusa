// Basic components without external dependencies
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/card"

// Yello Solar branded components
export { YelloSolarButton } from "./components/yello-solar-button"
export { YelloSolarAlert, SuccessAlert, ErrorAlert, InfoAlert, WarningAlert } from "./components/yello-solar-alert"

// Icons and branding
export { YshGradientIcon } from "./components/YshGradientIcon"
export { YshLogoMark } from "./components/YshLogoMark"
export { GradientDefs } from "./components/GradientDefs.tsx"
export { DegradedBanner } from "./components/degraded-banner"

// Utility functions
export { clx } from "./utils/clx"
export { cn } from "./utils/cn"

// CSS entrypoints (consumer should import these in their app root)
export const yshThemeCss = "@ysh/ui/styles/theme.css"
export const yshGradientsCss = "@ysh/ui/styles/gradients.css"

