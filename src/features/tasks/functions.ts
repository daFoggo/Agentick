import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requestLoggerMiddleware } from "@/lib/middleware";
import { CreateTaskSchema, FindTasksSchema, UpdateTaskSchema } from "./schemas";
import {
	createTask,
	deleteTask,
	fetchMyTasks,
	fetchTaskById,
	fetchTasks,
	updateTask,
} from "./server";

/**
 * Server Function lấy danh sách Task của Project
 */
export const fetchTasksFn = createServerFn({ method: "GET" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string().optional(),
			params: FindTasksSchema,
		}),
	)
	.handler(async ({ data }) => fetchTasks(data.projectId, data.params));

/**
 * Server Function lấy tất cả task của current user (Dashboard Overview)
 */
export const fetchMyTasksFn = createServerFn({ method: "GET" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(z.object({ params: FindTasksSchema }))
	.handler(async ({ data }) => fetchMyTasks(data.params));

/**
 * Server Function lấy chi tiết một Task
 */
export const fetchTaskByIdFn = createServerFn({ method: "GET" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string(),
			taskId: z.string(),
		}),
	)
	.handler(async ({ data }) => fetchTaskById(data.projectId, data.taskId));

/**
 * Server Function tạo mới một Task
 */
export const createTaskFn = createServerFn({ method: "POST" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string(),
			payload: CreateTaskSchema,
		}),
	)
	.handler(async ({ data }) => createTask(data.projectId, data.payload));

/**
 * Server Function cập nhật một Task
 */
export const updateTaskFn = createServerFn({ method: "POST" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string(),
			taskId: z.string(),
			payload: UpdateTaskSchema,
		}),
	)
	.handler(async ({ data }) =>
		updateTask(data.projectId, data.taskId, data.payload),
	);

/**
 * Server Function xóa một Task
 */
export const deleteTaskFn = createServerFn({ method: "POST" })
	.middleware([requestLoggerMiddleware])
	.inputValidator(
		z.object({
			projectId: z.string(),
			taskId: z.string(),
		}),
	)
	.handler(async ({ data }) => deleteTask(data.projectId, data.taskId));
