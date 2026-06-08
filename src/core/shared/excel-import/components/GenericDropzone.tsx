"use client";

import { useCallback } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/core/shared/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/core/shared/ui/file-upload";

export interface GenericDropzoneProps {
  onFileSelected: (file: File) => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  selectedFile?: File | null;
  /** Called when the user removes the selected file. */
  onFileClear?: () => void;
}

export function GenericDropzone({
  onFileSelected,
  acceptedFileTypes = ".xlsx,.xls",
  maxFileSizeMB = 10,
  selectedFile = null,
  onFileClear,
}: GenericDropzoneProps) {
  const maxSize = maxFileSizeMB * 1024 * 1024;

  const onFileReject = useCallback(
    (rejectedFile: File, message: string) => {
      toast.error(message, {
        description: `"${
          rejectedFile.name.length > 20
            ? `${rejectedFile.name.slice(0, 20)}...`
            : rejectedFile.name
        }" was rejected`,
      });
    },
    []
  );

  const handleFileChange = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        onFileSelected(files[0]);
      } else {
        onFileClear?.();
      }
    },
    [onFileSelected, onFileClear]
  );

  const files = selectedFile ? [selectedFile] : [];

  return (
    <div className="w-full space-y-4">
      <FileUpload
        maxFiles={1}
        maxSize={maxSize}
        accept={acceptedFileTypes}
        className="w-full"
        value={files}
        onValueChange={handleFileChange}
        onFileReject={onFileReject}
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-2 text-center py-4">
            <div className="flex items-center justify-center rounded-full border-2 border-dashed p-4">
              <FileSpreadsheet className="size-8 text-green-600" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">
                Drag and drop your Excel file here
              </p>
              <p className="text-muted-foreground text-xs">
                Or click to browse (max {maxFileSizeMB} MB)
              </p>
              <p className="text-muted-foreground text-xs">
                Accepted formats: {acceptedFileTypes}
              </p>
            </div>
            <FileUploadTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2">
                <Upload className="mr-2 h-4 w-4" />
                Select file
              </Button>
            </FileUploadTrigger>
          </div>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((f, index) => (
            <FileUploadItem key={index} value={f}>
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <X />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>
    </div>
  );
}
