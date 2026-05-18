import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/common/data-table";
import { RoleBadge } from "@/components/common/role-badge";
import { projectMembersQueryOptions } from "../queries";
import type { TProjectMember } from "../schemas";
import { projectMemberColumns } from "./columns";

interface IProjectMemberListProps {
	projectId: string;
	canManageProject?: boolean;
}

/**
 * Thành phần hiển thị danh sách tất cả các thành viên đang tham gia Project.
 * Hoàn toàn ủy thác việc xử lý loading/error cho Suspense Boundary cấp Route.
 */
export const ProjectMemberList = ({
	projectId,
	canManageProject = true,
}: IProjectMemberListProps) => {
	const { data: membersData } = useSuspenseQuery(
		projectMembersQueryOptions(projectId),
	);

	const members = membersData?.founds ?? [];
	const columns = canManageProject
		? projectMemberColumns
		: projectMemberColumns
				.filter((column) => column.id !== "actions")
				.map((column) =>
					column.id === "role" || (column as any).accessorKey === "role"
						? {
								...column,
								cell: ({ row }: any) => <RoleBadge role={row.original.role} />,
							}
						: column,
				);

	return (
		<DataTable<TProjectMember>
			data={members}
			columns={columns}
			getRowId={(row) => row.id}
			showPagination={false}
			enablePagination={false}
			enableRowSelection={false}
			enableColumnReorder={false}
			enableColumnPinning={false}
		/>
	);
};
