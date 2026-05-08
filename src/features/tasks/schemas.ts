import { z } from "zod";
import {
	ApiDateSchema,
	FindOrderingSchema,
	FindPageSchema,
	FindPageSizeWithAllSchema,
} from "@/lib/zod-common";
import type { TBaseFindResponse, TBaseSearchOptions } from "@/types/api";
import type { TProjectMember } from "../project-members";

/**
 * Schema cho Tag của Task
 */
export const TagSchema = z.object({
	id: z.string(),
	name: z.string(),
	color: z.string(),
	team_id: z.string(),
	created_at: ApiDateSchema,
});

export type TTag = z.infer<typeof TagSchema>;

/**
 * Schema cho Phase (Giai đoạn) của Task
 */
export const PhaseSchema = z.object({
	id: z.string(),
	project_id: z.string(),
	name: z.string(),
	order: z.number(),
	start_date: ApiDateSchema.optional(),
	end_date: ApiDateSchema.optional(),
	created_at: ApiDateSchema,
});

export type TPhase = z.infer<typeof PhaseSchema>;

/**
 * Schema chính cho Task trong Project
 */
export const ProjectTaskSchema = z.object({
	id: z.string(),
	created_at: ApiDateSchema,
	updated_at: ApiDateSchema,
	project_id: z.string(),
	parent_id: z.string().nullable(),
	title: z.string().min(1, "Title cannot be empty"),
	description: z.string().optional().nullable(),
	status_id: z.string(),
	type_id: z.string(),
	priority_id: z.string(),
	assigner_id: z.string(),
	assignee_ids: z.array(z.string()).optional(),
	phase_id: z.string().nullable(),
	start_date: ApiDateSchema.nullable().optional(),
	due_date: ApiDateSchema.nullable().optional(),
	order: z.number(),
	is_archived: z.boolean(),
	is_deleted: z.boolean(),
	// Các trường ảo hỗ trợ mapping UI, không nhất thiết có trong API response gốc hoặc được Join
	type: z.string().optional(),
	status: z.string().optional(),
	priority: z.string().optional(),
	estimated_hours: z.number().optional(),
	actual_hours: z.number().optional(),
});

/**
 * Type đầy đủ của một Task bao gồm các thông tin liên quan (Join)
 */
export type TTask = z.infer<typeof ProjectTaskSchema> & {
	tags?: TTag[];
	phase?: TPhase;
	assignees?: TProjectMember[];
	type_color?: string;
	status_color?: string;
	priority_color?: string;
};

/**
 * Schema cho việc tạo Task mới
 */
export const CreateTaskSchema = z.object({
	project_id: z.string().optional(),
	parent_id: z.string().nullable().optional(),
	title: z.string().min(1, "Title cannot be empty"),
	description: z.string().optional().nullable(),
	status_id: z.string(),
	type_id: z.string(),
	priority_id: z.string(),
	assigner_id: z.string(),
	assignee_ids: z.array(z.string()).optional(),
	phase_id: z.string().nullable().optional(),
	start_date: ApiDateSchema,
	due_date: ApiDateSchema,
	order: z.number().int(),
});

export type TCreateTaskInput = z.infer<typeof CreateTaskSchema>;

/**
 * Schema cho việc cập nhật Task
 */
export const UpdateTaskSchema = CreateTaskSchema.omit({
	project_id: true,
})
	.partial()
	.extend({
		is_archived: z.boolean().optional(),
	});

export type TUpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

/**
 * Schema cho việc tìm kiếm/lọc danh sách Task
 */
export const FindTasksSchema = z
	.object({
		id__eq: z.string().optional(),
		title__ilike: z.string().optional(),
		team_id__eq: z.string().optional(),
		status_id__eq: z.string().optional(),
		assignee_ids__contains: z.array(z.string()).optional(),
		is_archived__eq: z.boolean().optional(),
		is_deleted__eq: z.boolean().optional(),
		page: FindPageSchema,
		page_size: FindPageSizeWithAllSchema,
		ordering: FindOrderingSchema,
	})
	.optional();

export type TFindTasksInput = z.infer<typeof FindTasksSchema>;

/**
 * Phản hồi từ API cho danh sách Task
 */
export type TTasksResponse = TBaseFindResponse<
	TTask,
	TBaseSearchOptions<number | "all", string>
>;
