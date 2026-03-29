import { Toaster } from "@/components/ui/sonner"
import { useTheme } from "./theme-provider"

export const ToasterProvider = () => {
  const { theme } = useTheme()

  return <Toaster richColors closeButton theme={theme} position="top-right" />
}
