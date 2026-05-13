import { useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type TInboxItem, useInboxMutations } from "@/features/inbox";
import {
	navigateAfterInvitationAccept,
	useInvitationMutations,
} from "@/features/invitations";
import { getErrorMessage } from "@/lib/error";

interface IInboxInvitationContentProps {
	item: TInboxItem;
}

export const InboxInvitationContent = ({
	item,
}: IInboxInvitationContentProps) => {
	const navigate = useNavigate();
	const { accept: acceptInvitation } = useInvitationMutations();
	const { markAsRead } = useInboxMutations();

	const handleAccept = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (item.resource_id) {
			acceptInvitation.mutate(item.resource_id, {
				onSuccess: (result) => {
					toast.success("Invitation accepted successfully");
					navigateAfterInvitationAccept(result, navigate);
					markAsRead.mutate(item.id);
				},
				onError: (error) => {
					toast.error(getErrorMessage(error, "Failed to accept invitation"));
				},
			});
		}
	};

	return (
		<Card className="border-primary/20 bg-primary/5" size="sm">
			<CardHeader className="text-center">
				<div className="mb-2 flex justify-center">
					<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
						<UserPlus className="size-6" />
					</div>
				</div>
				<CardTitle>Project Invitation</CardTitle>
				<CardDescription>
					You have been invited to join a project.
				</CardDescription>
			</CardHeader>
			<CardFooter className="flex justify-center">
				<Button onClick={handleAccept} className="w-full">
					Accept Invitation
				</Button>
			</CardFooter>
		</Card>
	);
};
