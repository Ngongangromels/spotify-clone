import { create } from "zustand";

interface UploadMoodalStore {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void;
}

const useUploadModal = create<UploadMoodalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({ isOpen: false })
}))

export default useUploadModal