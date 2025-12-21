import { PartialType } from '@nestjs/mapped-types';
import { CreateCardTemplateDto } from './create-card-template.dto';

export class UpdateCardTemplateDto extends PartialType(CreateCardTemplateDto) {}
