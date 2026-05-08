import { signInFn, signOutFn, signUpFn } from "./functions";
import type { TSignInInput, TSignUpInput } from "./schemas";

export const authMutationOptions = {
	signIn: () => ({
		mutationFn: (variables: TSignInInput) => signInFn({ data: variables }),
	}),
	signUp: () => ({
		mutationFn: (variables: TSignUpInput) => signUpFn({ data: variables }),
	}),
	signOut: () => ({
		mutationFn: () => signOutFn(),
	}),
};
