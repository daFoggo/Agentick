import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignInSchema } from "@/features/users/schemas"
import { authMutationOptions } from "@/features/users/queries"

export const Route = createFileRoute("/auth/sign-in")({
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const signInMutation = useMutation(authMutationOptions.signIn())

  const form = useForm({
    defaultValues: {
      email__eq: "",
      password: "",
    },
    validators: {
      onSubmit: SignInSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const response = await signInMutation.mutateAsync(value)
        // Store token in localStorage
        localStorage.setItem("access_token", response.access_token)
        toast.success("Đăng nhập thành công")
        navigate({ to: "/dashboard" })
      } catch (error) {
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại.")
        console.error(error)
      }
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Đăng nhập
          </CardTitle>
          <CardDescription>
            Nhập email và mật khẩu của bạn để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            <FieldGroup>
              <form.Field
                name="email__eq"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="name@example.com"
                        type="email"
                        aria-invalid={isInvalid}
                        autoComplete="username"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />

              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched &&
                    !!field.state.meta.errors.length
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Mật khẩu</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type="password"
                        aria-invalid={isInvalid}
                        autoComplete="current-password"
                      />
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )
                }}
              />
            </FieldGroup>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full font-semibold"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
                </Button>
              )}
            />
          </form>

          <div className="mt-4 text-center text-sm">
            Chưa có tài khoản?{" "}
            <a
              href="/auth/sign-up"
              className="font-medium text-primary underline underline-offset-4"
            >
              Đăng ký ngay
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
