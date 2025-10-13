import { create } from "zustand";

type UIState = {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
};

export const useUI = create<UIState>((set) => ({
    sidebarOpen: false,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }))
}));