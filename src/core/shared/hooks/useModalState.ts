import { useState } from "react";

type AddModalType = "add";

export const useModalState = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<AddModalType | null>(null);

  const openModal = (type: AddModalType) => {
    setModalType(type);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);
  };

  return {
    isOpen,
    modalType,
    openModal,
    closeModal,
  };
};
