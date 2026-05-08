import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useInvitationMutations } from "@/features/invitations/queries";
import { markInboxAsReadFn } from "../functions";
import { inboxKeys } from "../queries";
import type { TInboxItem } from "../schemas";

interface IInboxInvitationContentProps {
	item: TInboxItem;
}

export const InboxInvitationContent = ({
	item,
}: IInboxInvitationContentProps) => {
	const { accept: acceptInvitation } = useInvitationMutations();
	const queryClient = useQueryClient();

	const archiveMutation = useMutation({
		mutationFn: (id: string) =>
			markInboxAsReadFn({ data: { inboxItemId: id } }),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: inboxKeys.all }),
	});

	const handleAccept = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (item.resource_id) {
			acceptInvitation.mutate(item.resource_id);
			archiveMutation.mutate(item.id);
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
