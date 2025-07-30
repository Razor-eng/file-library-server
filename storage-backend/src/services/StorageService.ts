import { PrismaClient } from "@prisma/client";
import { StorageFileDTO } from "../dtos/StorageFileDTO";
import { StorageResponseDTO } from "../dtos/StorageResponseDTO";

export class StorageService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async uploadFile(fileData: StorageFileDTO): Promise<StorageResponseDTO> {
    const fileId = Math.random().toString(36).substr(2, 9);
    const size = fileData.isFolder ? 0 : Math.floor(Math.random() * 10000000);

    const file = await this.prisma.file.create({
      data: {
        id: fileId,
        name: fileData.name,
        type: fileData.type,
        size,
        path: fileData.path,
        createdAt: fileData.createdAt,
        updatedAt: fileData.updatedAt,
        isFolder: fileData.isFolder,
        folderId: fileData.folderId,
        thumbnail: fileData.type.startsWith("image/")
          ? `/thumbnails/${fileId}`
          : undefined,
      },
    });

    return {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      path: file.path,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      isFolder: file.isFolder,
      folderId: file.folderId,
      thumbnail: file.thumbnail,
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.prisma.file.delete({
      where: { id: fileId },
    });
  }

  async moveFile(
    fileId: string,
    folderId?: string
  ): Promise<StorageResponseDTO> {
    const file = await this.prisma.file.update({
      where: { id: fileId },
      data: { folderId: folderId || null },
    });

    return {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      path: file.path,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      isFolder: file.isFolder,
      folderId: file.folderId,
      thumbnail: file.thumbnail,
    };
  }
}
