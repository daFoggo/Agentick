import { projectMembersQueryOptions } from "../queries"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { DataTable } from "@/components/common/data-table"
import type { TProjectMember } from "../schemas"
import { projectMemberColumns } from "./columns"

interface IProjectMemberListProps {
  projectId: string
}

export const ProjectMemberList = ({ projectId }: IProjectMemberListProps) => {
  const {
    data: membersData,
    isLoading,
    error,
  } = useQuery(projectMembersQueryOptions(projectId))

  const members = membersData?.founds ?? []

  if (isLoading) {
    return (
      <div className="flex h-32 w-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-32 w-full items-center justify-center text-destructive">
        Error loading members
      </div>
    )
  }

  return (
    <DataTable<TProjectMember>
      data={members}
      columns={projectMemberColumns}
      getRowId={(row) => row.id}
      showPagination={false}
      enablePagination={false}
      enableRowSelection={false}
      enableColumnReorder={false}
      enableColumnPinning={false}
    />
  )
}
