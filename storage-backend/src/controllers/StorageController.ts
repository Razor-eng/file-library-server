import {
  JsonController,
  Post,
  Delete,
  Put,
  Body,
  Param,
  HttpError,
} from "routing-controllers";
import { validate } from "class-validator";
import { StorageService } from "../services/StorageService";
import { StorageFileDTO } from "../dtos/StorageFileDTO";
import { StorageResponseDTO } from "../dtos/StorageResponseDTO";

@JsonController("/api/storage")
export class StorageController {
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService();
  }

  @Post("/upload")
  async uploadFile(
    @Body() fileData: StorageFileDTO
  ): Promise<StorageResponseDTO> {
    try {
      console.log("Received payload in StorageController:", fileData);
      const errors = await validate(fileData);
      if (errors.length > 0) {
        console.error("Validation errors:", errors);
        throw new HttpError(
          400,
          `Validation failed: ${JSON.stringify(errors)}`
        );
      }
      const result = await this.storageService.uploadFile(fileData);
      console.log("StorageService response:", result);
      return result;
    } catch (error: any) {
      console.error("StorageController uploadFile error:", error);
      throw new HttpError(500, `Failed to store file: ${error.message}`);
    }
  }

  @Delete("/:id")
  async deleteFile(@Param("id") fileId: string): Promise<{ message: string }> {
    try {
      await this.storageService.deleteFile(fileId);
      return { message: "File deleted from storage" };
    } catch (error: any) {
      console.error("StorageController deleteFile error:", error);
      throw new HttpError(
        500,
        `Failed to delete file from storage: ${error.message}`
      );
    }
  }

  @Put("/:id/move")
  async moveFile(
    @Param("id") fileId: string,
    @Body() body: { folderId?: string }
  ): Promise<StorageResponseDTO> {
    try {
      return await this.storageService.moveFile(fileId, body.folderId);
    } catch (error: any) {
      console.error("StorageController moveFile error:", error);
      throw new HttpError(
        500,
        `Failed to move file in storage: ${error.message}`
      );
    }
  }
}
