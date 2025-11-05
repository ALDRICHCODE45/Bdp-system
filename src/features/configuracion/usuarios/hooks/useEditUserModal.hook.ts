"use client";

import { useModalState } from "@/core/shared/hooks/useModalState";

export const useEditUserModal = () => {
  const {
    isOpen: isEditUserModalOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
    modalType: editModalType,
  } = useModalState();

  const handleOpenEditModal = () => {
    openEditModal("add");
  };

  return {
    isEditUserModalOpen,
    editModalType,
    handleOpenEditModal,
    closeEditModal,
  };
};

