import { create } from "zustand"
import { persist } from "zustand/middleware"

interface KanbanState {
  columnOrders: Record<string, string[]> // projectId -> statusIds[]
  setColumnOrder: (projectId: string, statusIds: string[]) => void
  getColumnOrder: (projectId: string) => string[] | undefined
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      columnOrders: {},
      setColumnOrder: (projectId, statusIds) =>
        set((state) => ({
          columnOrders: {
            ...state.columnOrders,
            [projectId]: statusIds,
          },
        })),
      getColumnOrder: (projectId) => get().columnOrders[projectId],
    }),
    {
      name: "kanban-storage",
    }
  )
)
