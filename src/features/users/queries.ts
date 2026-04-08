import { signInFn, signUpFn } from "./functions"
import type { TSignInInput, TSignUpInput } from "./schemas"

/**
 * @description Mutation options cho tính năng Auth
 */
export const authMutationOptions = {
  signIn: () => ({
    mutationFn: (variables: TSignInInput) => signInFn({ data: variables }),
  }),
  signUp: () => ({
    mutationFn: (variables: TSignUpInput) => signUpFn({ data: variables }),
  }),
}
