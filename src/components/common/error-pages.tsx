import { PixelBackground } from "@/components/decorations/pixel-background"
import { AuthPageHeader } from "@/components/layout/auth/page-header"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"
import { Home, RotateCcw } from "lucide-react"
import { Textarea } from "../ui/textarea"

export const NotFound = () => {
  return (
    <PixelBackground
      className="h-screen bg-background"
      gap={10}
      speed={20}
      pattern="cursor"
      darkColors="#0d1b4b,#1a3a8f,#2563eb"
      lightColors="#bfdbfe,#93c5fd,#3b82f6"
    >
      <div className="flex h-full flex-col p-6">
        <AuthPageHeader />
        <main className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
          <p className="font-mono text-6xl font-bold text-foreground">404</p>
          <p className="text-xl text-muted-foreground">
            Oops! The page you are looking for does not exist.
          </p>
          <Button asChild>
            <Link to="/">Go back home</Link>
          </Button>
        </main>
      </div>
    </PixelBackground>
  )
}

export const ErrorFallback = ({
  error,
  reset,
}: {
  error: any
  reset: () => void
}) => {
  return (
    <PixelBackground
      className="h-screen bg-background"
      gap={10}
      speed={20}
      pattern="cursor"
      darkColors="#0d1b4b,#1a3a8f,#2563eb"
      lightColors="#bfdbfe,#93c5fd,#3b82f6"
    >
      <div className="flex h-full flex-col p-6">
        <AuthPageHeader />
        <main className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
          <p className="font-mono text-6xl font-bold text-foreground">500</p>
          <p className="text-xl text-muted-foreground">
            Something went wrong on our end.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => reset()} variant="outline">
              Try again
              <RotateCcw className="size-4" />
            </Button>
            <Button asChild>
              <Link to="/">
                Go back home
                <Home className="size-4" />
              </Link>
            </Button>
          </div>
        </main>
      </div>
    </PixelBackground>
  )
}
