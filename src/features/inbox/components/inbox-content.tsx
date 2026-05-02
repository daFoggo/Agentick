import type { TInboxItem } from "../schemas"
import { InboxInvitationContent } from "./inbox-invitation-content"
import { InboxSystemContent } from "./inbox-system-content"

interface IInboxContentProps {
  item: TInboxItem
}

export const InboxContent = ({ item }: IInboxContentProps) => {
  switch (item.type) {
    case "INVITATION":
      return <InboxInvitationContent item={item} />
    default:
      return <InboxSystemContent item={item} />
  }
}
