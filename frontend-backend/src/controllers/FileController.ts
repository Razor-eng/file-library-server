import {
  JsonController,
  Get,
  Post,
  Delete,
  Put,
  QueryParam,
  Body,
  Param,
  HttpError,
} from "routing-controllers";
import { validate } from "class-validator";
import { FileService } from "../services/FileService";
import { FileUploadDTO } from "../dtos/FileUploadDTO";
import { FileResponseDTO } from "../dtos/FileResponseDTO";

@JsonController("/api")
export class FileController {
  private fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  @Get("/files")
  async getFiles(
    @QueryParam("folderId") folderId?: string
  ): Promise<FileResponseDTO[]> {
    try {
      return await this.fileService.getFiles(folderId);
    } catch (error: any) {
      throw new HttpError(500, `Failed to fetch files: ${error.message}`);
    }
  }

  @Post("/files/upload")
  async uploadFile(
    @Body() uploadData: FileUploadDTO
  ): Promise<FileResponseDTO> {
    try {
      const errors = await validate(uploadData);
      if (errors.length > 0) {
        throw new HttpError(
          400,
          `Validation failed: ${JSON.stringify(errors)}`
        );
      }
      return await this.fileService.uploadFile({
        ...uploadData,
        isFolder: false, // Explicitly set isFolder for file uploads
      });
    } catch (error: any) {
      throw new HttpError(500, `Failed to upload file: ${error.message}`);
    }
  }

  @Post("/folders")
  async createFolder(
    @Body() folderData: FileUploadDTO
  ): Promise<FileResponseDTO> {
    try {
      const errors = await validate(folderData);
      if (errors.length > 0) {
        throw new HttpError(
          400,
          `Validation failed: ${JSON.stringify(errors)}`
        );
      }
      return await this.fileService.createFolder({
        ...folderData,
        isFolder: true, // Explicitly set isFolder for folder creation
      });
    } catch (error: any) {
      throw new HttpError(500, `Failed to create folder: ${error.message}`);
    }
  }

  @Delete("/files/:id")
  async deleteFile(@Param("id") fileId: string): Promise<{ message: string }> {
    try {
      await this.fileService.deleteFile(fileId);
      return { message: "File deleted successfully" };
    } catch (error: any) {
      throw new HttpError(500, `Failed to delete file: ${error.message}`);
    }
  }

  @Put("/files/:id/move")
  async moveFile(
    @Param("id") fileId: string,
    @Body() body: { folderId?: string }
  ): Promise<FileResponseDTO> {
    try {
      if (
        body.folderId &&
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          body.folderId
        )
      ) {
        throw new HttpError(400, `Invalid folderId: must be a valid UUID`);
      }
      return await this.fileService.moveFile(fileId, body.folderId);
    } catch (error: any) {
      throw new HttpError(500, `Failed to move file: ${error.message}`);
    }
  }
}
