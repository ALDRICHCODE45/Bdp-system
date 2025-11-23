export interface FileEntity {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  content: Buffer;
  createdAt: Date;
  updatedAt: Date;
}
