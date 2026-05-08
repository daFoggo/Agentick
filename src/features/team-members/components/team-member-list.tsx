import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
	const {
		data: membersData,
		isLoading,
		error,
	} = useQuery(teamMembersQueryOptions(teamId));

	const members = membersData?.founds ?? [];

	if (isLoading) {
		return (
			<div className="flex h-32 w-full items-center justify-center">
				<Loader2 className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex h-32 w-full items-center justify-center text-destructive">
				Error loading members
			</div>
		);
	}

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
