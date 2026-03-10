import { PartialType } from '@nestjs/mapped-types';
import { CreateRecognitionDto } from './create-recognition.dto';

export class UpdateRecognitionDto extends PartialType(CreateRecognitionDto) {}
