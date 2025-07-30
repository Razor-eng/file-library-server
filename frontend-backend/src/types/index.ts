export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
  isFolder: boolean;
  folderId?: string;
  thumbnail?: string;
}