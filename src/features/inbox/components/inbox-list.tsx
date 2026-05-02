import { InboxItem } from "./inbox-item"
import type { TInboxItem } from "../schemas"
import { Inbox } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Fragment } from "react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useInboxStore } from "@/stores/use-inbox-store"

interface IInboxListProps {
  items: TInboxItem[]
}

export const InboxList = ({ items }: IInboxListProps) => {
  const { selectedItemId } = useInboxStore()

  if (items.length === 0) {
    return (
      <Empty className="border-none bg-transparent">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Inbox />
          </EmptyMedia>
          <EmptyTitle>All caught up!</EmptyTitle>
          <EmptyDescription>
            You have no new inbox items at the moment.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div>
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <InboxItem 
            item={item}
            isSelected={selectedItemId === item.id}
          />
          {index < items.length - 1 && <Separator />}
        </Fragment>
      ))}
    </div>
  )
}
