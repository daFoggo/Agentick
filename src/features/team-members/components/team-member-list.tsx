import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/common/data-table";
import { teamMembersQueryOptions } from "../queries";
import type { TTeamMember } from "../schemas";
import { teamMemberColumns } from "./columns";

interface ITeamMemberListProps {
	teamId: string;
}

/**
 * Hiển thị danh sách các thành viên trong Team dưới dạng bảng dữ liệu (DataTable).
 */
export const TeamMemberList = ({ teamId }: ITeamMemberListProps) => {
	const { data: membersData } = useSuspenseQuery(
		teamMembersQueryOptions(teamId),
	);

	const members = membersData?.founds ?? [];

	return (
		<DataTable<TTeamMember>
			data={members}
			columns={teamMemberColumns}
			getRowId={(row) => row.id}
			showPagination={false}
			enablePagination={false}
			enableRowSelection={false}
			enableColumnReorder={false}
			enableColumnPinning={false}
		/>
	);
};
