import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertCircle,
	CheckCircle2,
	Loader2,
	LogOut,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { userQueries } from "@/features/users";
import { deleteAuthToken, getAuthToken } from "@/lib/auth-token";
import { invitationQueries, useInvitationMutations } from "../queries";

interface IAcceptInviteCardProps {
	invitationId: string;
}

export function AcceptInviteCard({ invitationId }: IAcceptInviteCardProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [status, setStatus] = useState<
		"idle" | "loading" | "success" | "error"
	>("idle");
	const [errorMessage, setErrorMessage] = useState("");

	const { data: invitation, isLoading: isFetchingInvitation } = useQuery(
		invitationQueries.getById(invitationId),
	);
	const { data: currentUser, isLoading: isFetchingUser } = useQuery({
		...userQueries.me(),
		retry: false,
	});

	const isLoading = isFetchingInvitation || isFetchingUser;

	const isEmailMismatch =
		currentUser &&
		invitation &&
		currentUser.email.trim().toLowerCase() !==
			invitation.email.trim().toLowerCase();

	const { accept, decline } = useInvitationMutations();

	const handleAccept = async () => {
		const currentToken = await getAuthToken();
		if (!currentToken) {
			toast.info("Please sign up or sign in to accept the invitation");
			navigate({
				to: "/auth/sign-up",
				search: {
					redirect: window.location.href,
				},
			});
			return;
		}

		setStatus("loading");
		try {
			await accept.mutateAsync(invitationId);
			setStatus("success");
			toast.success("Successfully joined the organization");
		} catch (error: any) {
			setStatus("error");
			setErrorMessage(error?.message || "Failed to accept the invitation");
		}
	};

	const handleSwitchAccount = async () => {
		await deleteAuthToken();
		queryClient.clear();
		navigate({
			to: "/auth/sign-in",
			search: {
				redirect: window.location.href,
			},
		});
	};

	const handleDecline = async () => {
		setStatus("loading");
		try {
			await decline.mutateAsync(invitationId);
			toast.success("Invitation declined");
			navigate({ to: "/dashboard" });
		} catch (error: any) {
			setStatus("error");
			setErrorMessage(error?.message || "Failed to decline the invitation");
		}
	};

	return (
		<Card className="w-full max-w-md border-primary/10 shadow-lg">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl font-bold tracking-tight">
					{invitation
						? `Invitation to join ${invitation.project?.name || invitation.team?.name}`
						: "Invitation to join"}
				</CardTitle>
				<CardDescription className="mt-2 text-muted-foreground/80">
					{invitation ? (
						<div className="flex flex-col gap-1">
							<p>
								You have been invited by <b>{invitation.inviter?.name}</b> to
								join their {invitation.project_id ? "project" : "team"}.
							</p>
							<p className="mt-1 text-xs">
								Invitation sent to:{" "}
								<span className="font-medium text-foreground">
									{invitation.email}
								</span>
							</p>
						</div>
					) : (
						"You have been invited to join an organization. Click below to accept the invitation and gain access."
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4 py-6">
				{isEmailMismatch && status === "idle" && (
					<Alert
						variant="destructive"
						className="border-destructive/20 bg-destructive/5"
					>
						<AlertCircle className="size-4" />
						<AlertTitle>Account Mismatch</AlertTitle>
						<AlertDescription className="text-xs">
							You are currently logged in as{" "}
							<span className="font-semibold">{currentUser.email}</span>. This
							invitation is intended for{" "}
							<span className="font-semibold">{invitation.email}</span>. Please
							switch accounts to accept.
						</AlertDescription>
					</Alert>
				)}

				<div className="flex flex-col items-center justify-center gap-4 py-4">
					{(status === "idle" || isLoading) && (
						<div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner">
							{isLoading ? (
								<Loader2 className="size-10 animate-spin" />
							) : (
								<CheckCircle2 className="size-10" />
							)}
						</div>
					)}
					{status === "loading" && (
						<div className="flex flex-col items-center gap-3">
							<Loader2 className="size-10 animate-spin text-primary" />
							<span className="text-sm font-medium text-muted-foreground">
								Processing your invitation...
							</span>
						</div>
					)}
					{status === "success" && (
						<div className="flex animate-in flex-col items-center gap-3 duration-300 zoom-in-95">
							<div className="flex size-20 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner dark:bg-green-900/30 dark:text-green-500">
								<CheckCircle2 className="size-10" />
							</div>
							<span className="text-lg font-semibold text-green-600 dark:text-green-500">
								Accepted Successfully!
							</span>
						</div>
					)}
					{status === "error" && (
						<div className="flex animate-in flex-col items-center gap-3 duration-300 zoom-in-95">
							<div className="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-inner">
								<XCircle className="size-10" />
							</div>
							<span className="text-center font-semibold text-destructive">
								{errorMessage}
							</span>
						</div>
					)}
				</div>
			</CardContent>
			<CardFooter className="flex w-full flex-col gap-2">
				{status === "idle" &&
					(isEmailMismatch ? (
						<Button
							className="w-full"
							onClick={handleSwitchAccount}
							size="lg"
							variant="outline"
						>
							<LogOut className="mr-2 size-4" />
							Switch Account
						</Button>
					) : (
						<Button
							className="w-full shadow-md transition-all hover:shadow-lg"
							onClick={handleAccept}
							size="lg"
						>
							Accept Invitation
						</Button>
					))}
				{status === "success" && (
					<Button
						className="w-full shadow-md transition-all hover:shadow-lg"
						onClick={() => navigate({ to: "/dashboard" })}
						size="lg"
					>
						Go to Dashboard
					</Button>
				)}
				{(status === "error" || status === "idle") && (
					<Button
						variant="ghost"
						className="w-full text-muted-foreground hover:text-foreground"
						onClick={
							status === "idle"
								? handleDecline
								: () => navigate({ to: "/dashboard" })
						}
					>
						{status === "error" ? "Return to Dashboard" : "Decline Invitation"}
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
