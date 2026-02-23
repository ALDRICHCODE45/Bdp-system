import { useState, useCallback } from "react";
import { ImportExcelPreviewDto, ImportOptionsDto } from "../server/dtos/ImportExcelPreviewDto.dto";
import { ImportExecutionResultDto } from "../server/dtos/ImportFacturaResultDto.dto";

export type ImportStep = "upload" | "preview" | "executing" | "results";

type ImportState = {
  step: ImportStep;
  file: File | null;
  preview: ImportExcelPreviewDto | null;
  options: ImportOptionsDto;
  results: ImportExecutionResultDto | null;
};

const initialState: ImportState = {
  step: "upload",
  file: null,
  preview: null,
  options: {
    duplicadasAActualizar: [],
    actualizarTodasDuplicadas: false,
  },
  results: null,
};

export const useImportFacturasState = () => {
  const [state, setState] = useState<ImportState>(initialState);

  const setFile = useCallback((file: File | null) => {
    setState((prev) => ({ ...prev, file }));
  }, []);

  const setPreview = useCallback((preview: ImportExcelPreviewDto | null) => {
    setState((prev) => ({
      ...prev,
      preview,
      step: preview ? "preview" : prev.step,
    }));
  }, []);

  const setOptions = useCallback((options: Partial<ImportOptionsDto>) => {
    setState((prev) => ({
      ...prev,
      options: { ...prev.options, ...options },
    }));
  }, []);

  const toggleDuplicadaUpdate = useCallback((facturaId: string) => {
    setState((prev) => {
      const currentList = prev.options.duplicadasAActualizar;
      const newList = currentList.includes(facturaId)
        ? currentList.filter((id) => id !== facturaId)
        : [...currentList, facturaId];

      return {
        ...prev,
        options: {
          ...prev.options,
          duplicadasAActualizar: newList,
        },
      };
    });
  }, []);

  const toggleActualizarTodas = useCallback(() => {
    setState((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        actualizarTodasDuplicadas: !prev.options.actualizarTodasDuplicadas,
        duplicadasAActualizar: [],
      },
    }));
  }, []);

  const setStep = useCallback((step: ImportStep) => {
    setState((prev) => ({ ...prev, step }));
  }, []);

  const setResults = useCallback((results: ImportExecutionResultDto | null) => {
    setState((prev) => ({
      ...prev,
      results,
      step: results ? "results" : prev.step,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const goToUpload = useCallback(() => {
    setState((prev) => ({ ...prev, step: "upload" }));
  }, []);

  const goToPreview = useCallback(() => {
    setState((prev) => ({ ...prev, step: "preview" }));
  }, []);

  const startExecution = useCallback(() => {
    setState((prev) => ({ ...prev, step: "executing" }));
  }, []);

  return {
    ...state,
    setFile,
    setPreview,
    setOptions,
    toggleDuplicadaUpdate,
    toggleActualizarTodas,
    setStep,
    setResults,
    reset,
    goToUpload,
    goToPreview,
    startExecution,
  };
};
