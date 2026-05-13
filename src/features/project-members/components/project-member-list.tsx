import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/common/data-table";
import { projectMembersQueryOptions } from "../queries";
import type { TProjectMember } from "../schemas";
import { projectMemberColumns } from "./columns";

interface IProjectMemberListProps {
	projectId: string;
}

/**
 * Thành phần hiển thị danh sách tất cả các thành viên đang tham gia Project.
 * Hoàn toàn ủy thác việc xử lý loading/error cho Suspense Boundary cấp Route.
 */
export const ProjectMemberList = ({ projectId }: IProjectMemberListProps) => {
	const { data: membersData } = useSuspenseQuery(
		projectMembersQueryOptions(projectId),
	);

	const members = membersData?.founds ?? [];

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
	);
};
