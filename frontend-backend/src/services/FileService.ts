import { PrismaClient } from "@prisma/client";
import axios, { AxiosError } from "axios";
import { FileUploadDTO } from "../dtos/FileUploadDTO";
import { FileResponseDTO } from "../dtos/FileResponseDTO";

export class FileService {
  private prisma: PrismaClient;
  private storageBackendUrl: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.storageBackendUrl =
      process.env.STORAGE_BACKEND_URL || "http://localhost:3002";
  }

  async getFiles(folderId?: string): Promise<FileResponseDTO[]> {
    const files = await this.prisma.file.findMany({
      where: { folderId: folderId || null },
    });

    return files.map((file) => ({
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
    }));
  }

  async uploadFile(uploadData: FileUploadDTO): Promise<FileResponseDTO> {
    try {
      const now = new Date();
      const storagePayload = {
        name: uploadData.name,
        type: uploadData.type,
        path: uploadData.path,
        folderId: uploadData.folderId,
        createdAt: now, // Send Date object instead of string
        updatedAt: now,
        isFolder: false,
      };

      console.log("Sending to Storage Backend:", storagePayload);

      const storageResponse = await axios.post(
        `${this.storageBackendUrl}/api/storage/upload`,
        storagePayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Storage Backend Response:", storageResponse.data);

      const file = await this.prisma.file.create({
        data: {
          ...uploadData,
          id: storageResponse.data.id,
          size: storageResponse.data.size,
          createdAt: now,
          updatedAt: now,
          isFolder: false,
          thumbnail: storageResponse.data.thumbnail,
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
    } catch (error: any) {
      if (error instanceof AxiosError) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: error.config,
        });
        throw new Error(
          `Storage backend error: ${
            error.response?.status || "unknown"
          } - ${JSON.stringify(error.response?.data || error.message)}`
        );
      }
      console.error("Upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async createFolder(folderData: FileUploadDTO): Promise<FileResponseDTO> {
    try {
      const now = new Date();
      const folderId = Math.random().toString(36).substr(2, 9);
      const storagePayload = {
        name: folderData.name,
        type: folderData.type || "folder",
        path: folderData.path,
        folderId: folderData.folderId,
        createdAt: now,
        updatedAt: now,
        isFolder: true,
      };

      // Send folder creation to storage backend
      const storageResponse = await axios.post(
        `${this.storageBackendUrl}/api/storage/upload`,
        storagePayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const folder = await this.prisma.file.create({
        data: {
          ...folderData,
          id: storageResponse.data.id,
          size: 0,
          createdAt: now,
          updatedAt: now,
          isFolder: true,
          thumbnail: null,
        },
      });

      return {
        id: folder.id,
        name: folder.name,
        type: folder.type,
        size: folder.size,
        path: folder.path,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        isFolder: folder.isFolder,
        folderId: folder.folderId,
        thumbnail: folder.thumbnail,
      };
    } catch (error: any) {
      if (error instanceof AxiosError) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: error.config,
        });
        throw new Error(
          `Storage backend error: ${
            error.response?.status || "unknown"
          } - ${JSON.stringify(error.response?.data || error.message)}`
        );
      }
      console.error("Create folder error:", error);
      throw new Error(`Folder creation failed: ${error.message}`);
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      await axios.delete(`${this.storageBackendUrl}/api/storage/${fileId}`);
      await this.prisma.file.delete({
        where: { id: fileId },
      });
    } catch (error: any) {
      if (error instanceof AxiosError) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: error.config,
        });
        throw new Error(
          `Storage backend error: ${
            error.response?.status || "unknown"
          } - ${JSON.stringify(error.response?.data || error.message)}`
        );
      }
      console.error("Delete error:", error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async moveFile(fileId: string, folderId?: string): Promise<FileResponseDTO> {
    try {
      const file = await this.prisma.file.update({
        where: { id: fileId },
        data: { folderId: folderId || null },
      });

      await axios.put(`${this.storageBackendUrl}/api/storage/${fileId}/move`, {
        folderId,
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
    } catch (error: any) {
      if (error instanceof AxiosError) {
        console.error("Axios error details:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          config: error.config,
        });
        throw new Error(
          `Storage backend error: ${
            error.response?.status || "unknown"
          } - ${JSON.stringify(error.response?.data || error.message)}`
        );
      }
      console.error("Move error:", error);
      throw new Error(`Move failed: ${error.message}`);
    }
  }
}
