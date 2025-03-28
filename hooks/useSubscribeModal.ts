import { create } from "zustand";

interface SubscribeModal {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const useSubscribeModal = create<SubscribeModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useSubscribeModal;
