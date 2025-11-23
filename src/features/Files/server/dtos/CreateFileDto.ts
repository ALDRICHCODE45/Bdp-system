export interface CreateFileDto {
  fileName: string;
  contentType: string;
  fileSize: number;
  content: Buffer;
}
