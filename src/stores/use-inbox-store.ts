import { create } from "zustand";

interface InboxStore {
	selectedItemId: string | null;
	setSelectedItemId: (id: string | null) => void;
	clearSelection: () => void;
}

export const useInboxStore = create<InboxStore>((set) => ({
	selectedItemId: null,
	setSelectedItemId: (id: string | null) => set({ selectedItemId: id }),
	clearSelection: () => set({ selectedItemId: null }),
}));
