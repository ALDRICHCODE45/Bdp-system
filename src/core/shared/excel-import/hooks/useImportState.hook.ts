"use client";

import { useState, useCallback } from "react";
import type { ImportStep } from "../types/excel-import.types";

/**
 * Generic import wizard state machine.
 *
 * Manages the step flow: upload -> preview -> executing -> results.
 * Consumer provides TPreview and TResult type parameters.
 */

export interface ImportState<TPreview, TResult> {
  step: ImportStep;
  file: File | null;
  preview: TPreview | null;
  result: TResult | null;
  options: Record<string, unknown>;
}

export interface UseImportStateReturn<TPreview, TResult> {
  state: ImportState<TPreview, TResult>;
  setFile: (file: File | null) => void;
  setPreview: (preview: TPreview) => void;
  setResult: (result: TResult) => void;
  setOptions: (opts: Record<string, unknown>) => void;
  updateOptions: (partial: Record<string, unknown>) => void;
  startExecution: () => void;
  reset: () => void;
  goToUpload: () => void;
}

function createInitialState<TPreview, TResult>(): ImportState<
  TPreview,
  TResult
> {
  return {
    step: "upload",
    file: null,
    preview: null,
    result: null,
    options: {},
  };
}

export function useImportState<
  TPreview,
  TResult,
>(): UseImportStateReturn<TPreview, TResult> {
  const [state, setState] = useState<ImportState<TPreview, TResult>>(
    createInitialState<TPreview, TResult>
  );

  const setFile = useCallback((file: File | null) => {
    setState((prev) => ({ ...prev, file }));
  }, []);

  const setPreview = useCallback((preview: TPreview) => {
    setState((prev) => ({
      ...prev,
      preview,
      step: "preview",
    }));
  }, []);

  const setResult = useCallback((result: TResult) => {
    setState((prev) => ({
      ...prev,
      result,
      step: "results",
    }));
  }, []);

  const setOptions = useCallback((opts: Record<string, unknown>) => {
    setState((prev) => ({ ...prev, options: opts }));
  }, []);

  const updateOptions = useCallback((partial: Record<string, unknown>) => {
    setState((prev) => ({
      ...prev,
      options: { ...prev.options, ...partial },
    }));
  }, []);

  const startExecution = useCallback(() => {
    setState((prev) => ({ ...prev, step: "executing" }));
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState<TPreview, TResult>);
  }, []);

  const goToUpload = useCallback(() => {
    setState((prev) => ({ ...prev, step: "upload" }));
  }, []);

  return {
    state,
    setFile,
    setPreview,
    setResult,
    setOptions,
    updateOptions,
    startExecution,
    reset,
    goToUpload,
  };
}
