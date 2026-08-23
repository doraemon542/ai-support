import { IsEnum, IsString, IsNotEmpty } from 'class-validator';

export enum ChannelDto {
  TELEGRAM = 'TELEGRAM',
  EMAIL = 'EMAIL',
}

export class CreateMessageDto {
  @IsEnum(ChannelDto)
  channel: ChannelDto;

  @IsString()
  @IsNotEmpty()
  externalId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
