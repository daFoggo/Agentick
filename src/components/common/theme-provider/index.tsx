import { useRouter } from "@tanstack/react-router"
import { createContext, type PropsWithChildren, use } from "react"
import { setThemeServerFn, type TTheme } from "@/lib/theme"

type TThemeContextVal = { theme: TTheme; setTheme: (val: TTheme) => void }
type TThemeProviderProps = PropsWithChildren<{ theme: TTheme }>

const ThemeContext = createContext<TThemeContextVal | null>(null)

export const ThemeProvider = ({ children, theme }: TThemeProviderProps) => {
  const router = useRouter()

  const setTheme = (val: TTheme) => {
    setThemeServerFn({ data: val }).then(() => router.invalidate())
  }

  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>
}

export const useTheme = () => {
  const val = use(ThemeContext)
  if (!val) throw new Error("useTheme called outside of ThemeProvider!")
  return val
}
