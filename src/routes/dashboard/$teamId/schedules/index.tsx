import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	BigCalendar,
	BigCalendarEventContent,
	BigCalendarEventPopover,
	BigCalendarSkeleton,
} from "@/components/common/big-calendar";
import { Button } from "@/components/ui/button";
import {
	DeleteEventDialog,
	EVENT_TYPE_OPTIONS,
	EventActionBar,
	EventPopoverContent,
	EventTypeFilter,
	eventsQueryOptions,
	useEventMutations,
} from "@/features/events";
import {
	formatSchedules,
	mySchedulesQueryOptions,
	WorkTimePattern,
} from "@/features/schedules";
import { taskQueries, useTaskMutations } from "@/features/tasks";
import { userQueries } from "@/features/users";
import type { IBigCalendarEvent } from "@/types/big-calendar";

export const Route = createFileRoute("/dashboard/$teamId/schedules/")({
	loader: async ({ context, params }) => {
		const userData = await context.queryClient.ensureQueryData(
			userQueries.me(),
		);
		await Promise.all([
			context.queryClient.ensureQueryData(mySchedulesQueryOptions()),
			context.queryClient.ensureQueryData(userQueries.me()),
			context.queryClient.ensureQueryData(
				eventsQueryOptions({ team_id__eq: params.teamId }),
			),
			context.queryClient.ensureQueryData(
				taskQueries.list(undefined, {
					team_id__eq: params.teamId,
					assignee_ids__contains: [userData.id],
					page_size: "all",
				}),
			),
		]);
	},
	component: RouteComponent,
	staticData: {
		getTitle: () => "Schedules",
		fixedHeight: true,
	},
});

function RouteComponent() {
	const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(
		EVENT_TYPE_OPTIONS.map((opt) => opt.value),
	);
	const [isMounted, setIsMounted] = useState(false);
	const [eventToDelete, setEventToDelete] = useState<IBigCalendarEvent | null>(
		null,
	);

	const { update: updateEvent } = useEventMutations();
	const { update: updateTask } = useTaskMutations();

	// Action bar state
	const [actionBarOpen, setActionBarOpen] = useState(false);
	const [actionBarEvent, setActionBarEvent] =
		useState<IBigCalendarEvent | null>(null);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const params = Route.useParams();
	const { data: userData } = useQuery(userQueries.me());
	const { data: eventsData } = useQuery(
		eventsQueryOptions({ team_id__eq: params.teamId }),
	);
	const { data: taskData } = useQuery(
		taskQueries.list(undefined, {
			team_id__eq: params.teamId,
			assignee_ids__contains: userData?.id ? [userData.id] : [],
			page_size: "all",
		}),
	);
	const { data: rawSchedules } = useQuery(mySchedulesQueryOptions());

	const schedules = useMemo(
		() => formatSchedules(rawSchedules, params.teamId, userData?.id),
		[rawSchedules, params.teamId, userData?.id],
	);

	const formattedEvents = eventsData?.formattedEvents || [];

	// Map tasks to calendar events
	const taskEvents = useMemo(() => {
		if (!taskData?.founds || !userData?.id) return [];
		return taskData.founds
			.filter((task) => {
				if (!task.start_date || !task.due_date) return false;

				// Ensure the current user is assigned to this task
				const isAssigned =
					task.assignee_ids?.includes(userData.id) ||
					task.assignees?.some((a) => a.user_id === userData.id);

				return isAssigned;
			})
			.map((task) => ({
				id: task.id,
				title: task.title,
				start: new Date(task.start_date || ""),
				end: new Date(task.due_date || ""),
				color: EVENT_TYPE_OPTIONS.find((opt) => opt.value === "task")
					?.calendarColor,
				meta: {
					...task,
					type: "task",
					participants: task.assignees,
				},
			})) as IBigCalendarEvent[];
	}, [taskData?.founds, userData?.id]);

	const filteredEvents = useMemo(() => {
		const allEvents = [...formattedEvents, ...taskEvents];
		return allEvents.filter((event) => {
			const type = event.meta?.type as string | undefined;
			if (!type) return true;
			return selectedEventTypes.includes(type);
		});
	}, [selectedEventTypes, formattedEvents, taskEvents]);

	const getSlotClassName = (date: Date, hour: number) => {
		if (!schedules) return "";
		const scheduleDay = schedules[date.getDay()];
		if (!scheduleDay || scheduleDay.is_off) return "bg-stripes";
		const startH = scheduleDay.start_time
			? parseInt(scheduleDay.start_time.split(":")[0], 10)
			: 0;
		const endH = scheduleDay.end_time
			? parseInt(scheduleDay.end_time.split(":")[0], 10)
			: 24;
		if (hour < startH || hour >= endH) return "bg-stripes";
		return "";
	};

	const openCreate = () => {
		setActionBarEvent(null);
		setActionBarOpen(true);
	};

	const openCreateWithSlot = (slot: any) => {
		setActionBarEvent({
			id: `new-${Date.now()}`,
			title: "",
			start: slot.start,
			end: slot.end,
			meta: {
				type: "meeting",
			},
		} as any);
		setActionBarOpen(true);
	};

	const openEdit = (event: IBigCalendarEvent) => {
		setActionBarEvent(event);
		setActionBarOpen(true);
	};

	const closeActionBar = (open: boolean) => {
		setActionBarOpen(open);
		if (!open) setActionBarEvent(null);
	};

	const handleEventChange = (
		event: IBigCalendarEvent,
		start: Date,
		end: Date,
	) => {
		const type = event.meta?.type as string;
		if (type === "task") {
			const task = event.meta as any;
			updateTask.mutate({
				projectId: task.project_id,
				taskId: event.id,
				payload: {
					start_date: start.toISOString(),
					due_date: end.toISOString(),
				},
			});
		} else {
			updateEvent.mutate({
				eventId: event.id,
				payload: {
					start_time: start.toISOString(),
					end_time: end.toISOString(),
				},
			});
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm md:flex-row">
				{/* Left Side */}
				<section className="no-scrollbar flex min-h-0 flex-col gap-4 overflow-y-auto border-r bg-card p-2 md:w-64 md:shrink-0">
					{/* Create button */}
					<div className="p-2">
						<Button className="w-full" onClick={openCreate}>
							<CalendarPlus className="size-4" />
							Create new event
						</Button>
					</div>

					<WorkTimePattern />
					<EventTypeFilter
						value={selectedEventTypes}
						onChange={setSelectedEventTypes}
					/>
				</section>

				{/* Right Side — BigCalendar */}
				<section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
					{isMounted ? (
						<BigCalendar
							events={filteredEvents}
							weekStartsOn={1}
							startHour={0}
							endHour={24}
							scrollToHour={6}
							headerClassName="p-4"
							slotClassName={getSlotClassName}
							onEventDrop={handleEventChange}
							onEventResize={handleEventChange}
							onSelectSlot={openCreateWithSlot}
							renderEvent={(event, layout) => (
								<BigCalendarEventPopover
									event={event}
									customContent={(evt) => (
										<EventPopoverContent
											event={evt}
											onEditClick={openEdit}
											onDeleteClick={setEventToDelete}
										/>
									)}
								>
									<BigCalendarEventContent
										event={event}
										height={layout.height}
									/>
								</BigCalendarEventPopover>
							)}
						/>
					) : (
						<BigCalendarSkeleton
							startHour={6}
							endHour={22}
							headerClassName="p-4"
						/>
					)}
				</section>
			</div>

			{/* Delete dialog — keep as AlertDialog since it's a destructive confirmation */}
			<DeleteEventDialog
				event={eventToDelete}
				open={!!eventToDelete}
				onOpenChange={(open) => {
					if (!open) setEventToDelete(null);
				}}
			/>

			{/* Unified Create / Edit action bar */}
			<EventActionBar
				open={actionBarOpen}
				onOpenChange={closeActionBar}
				event={actionBarEvent}
			/>
		</div>
	);
}
