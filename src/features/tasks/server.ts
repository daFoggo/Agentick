import "@tanstack/react-start/server-only";
import { api } from "@/lib/ky";
import type { TBaseResponse } from "@/types/api";
import {
	CreateTaskSchema,
	type TCreateTaskInput,
	type TFindTasksInput,
	type TTask,
	type TTasksResponse,
	type TUpdateTaskInput,
	UpdateTaskSchema,
} from "./schemas";

/**
 * Xây dựng đường dẫn API cho Task. Nếu có projectId thì lấy theo project, ngược lại lấy global.
 */
const buildTaskPath = (projectId?: string) =>
	projectId ? `projects/${projectId}/tasks` : `tasks`;

/**
 * Lấy tất cả task được assign cho current user (dùng cho Dashboard Overview).
 * Không cần truyền projectId — API tự lấy theo token.
 */
export async function fetchMyTasks(
	params?: TFindTasksInput,
): Promise<TTasksResponse> {
	const response = await api
		.get("users/me/tasks", {
			searchParams: params as
				| Record<string, string | number | boolean>
				| undefined,
		})
		.json<TBaseResponse<TTasksResponse>>();

	return response.data;
}

/**
 * Lấy danh sách các Task (có hỗ trợ filter và pagination).
 */
export async function fetchTasks(
	projectId?: string,
	params?: TFindTasksInput,
): Promise<TTasksResponse> {
	const response = await api
		.get(buildTaskPath(projectId), {
			searchParams: params as
				| Record<string, string | number | boolean>
				| undefined,
		})
		.json<TBaseResponse<TTasksResponse>>();

	return response.data;
}

/**
 * Lấy thông tin chi tiết của một Task theo TaskId trong Project.
 */
export async function fetchTaskById(
	projectId: string,
	taskId: string,
): Promise<TTask | null> {
	try {
		const response = await api
			.get(`${buildTaskPath(projectId)}/${taskId}`)
			.json<TBaseResponse<TTask>>();
		return response.data;
	} catch (error) {
		console.error("error fetch task detail:", error);
		return null;
	}
}

/**
 * Tạo một Task mới trong Project.
 */
export async function createTask(
	projectId: string,
	payload: TCreateTaskInput,
): Promise<TTask> {
	const response = await api
		.post(buildTaskPath(projectId), {
			json: CreateTaskSchema.parse({
				...payload,
				project_id: payload.project_id ?? projectId,
			}),
		})
		.json<TBaseResponse<TTask>>();

	return response.data;
}

/**
 * Cập nhật thông tin chi tiết của một Task.
 */
export async function updateTask(
	projectId: string,
	taskId: string,
	payload: TUpdateTaskInput,
): Promise<TTask> {
	const response = await api
		.patch(`${buildTaskPath(projectId)}/${taskId}`, {
			json: UpdateTaskSchema.parse(payload),
		})
		.json<TBaseResponse<TTask>>();

	return response.data;
}

/**
 * Thực hiện xóa một Task khỏi Project.
 */
export async function deleteTask(
	projectId: string,
	taskId: string,
): Promise<boolean> {
	const response = await api
		.delete(`${buildTaskPath(projectId)}/${taskId}`)
		.json<TBaseResponse<boolean>>();

	return response.data;
}
