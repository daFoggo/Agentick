import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "."

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <Button onClick={toggleTheme}>
      {theme === "dark" ? <Moon /> : <Sun />}
    </Button>
  )
}
