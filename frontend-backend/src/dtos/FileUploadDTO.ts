import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsBoolean,
} from "class-validator";

export class FileUploadDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;

  @IsBoolean()
  @IsOptional()
  isFolder?: boolean;
}
