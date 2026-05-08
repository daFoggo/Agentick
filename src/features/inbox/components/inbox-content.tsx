import type { TInboxItem } from "../schemas";
import { InboxInvitationContent } from "./inbox-invitation-content";
import { InboxSystemContent } from "./inbox-system-content";
import { InboxTaskAssignedContent } from "./inbox-task-assigned-content";

interface IInboxContentProps {
	item: TInboxItem;
}

export const InboxContent = ({ item }: IInboxContentProps) => {
	switch (item.type) {
		case "INVITATION":
			return <InboxInvitationContent item={item} />;
		case "TASK_ASSIGNED":
			return <InboxTaskAssignedContent item={item} />;
		default:
			return <InboxSystemContent item={item} />;
	}
};
