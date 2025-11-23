export interface UpdateFileDto {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileContent: Buffer;
}
