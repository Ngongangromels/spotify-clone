import { create } from "zustand";

interface AuthModalStore {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
}

const useAuthModal = create<AuthModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({ isOpen: false })
}))

export default useAuthModal