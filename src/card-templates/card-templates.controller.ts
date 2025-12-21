import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CardTemplatesService } from './card-templates.service';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';
import { Roles } from '../common/guards/roles.guard';
import { ParseIntIdPipe } from '../common/pipes/parse-int-id.pipe';

@Controller('card-templates')
@Roles('hr') // Все операции только для HR
export class CardTemplatesController {
  constructor(private readonly cardTemplatesService: CardTemplatesService) {}

  @Post()
  create(@Body() dto: CreateCardTemplateDto) {
    return this.cardTemplatesService.create(dto);
  }

  @Get()
  findAll() {
    return this.cardTemplatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntIdPipe()) id: number) {
    return this.cardTemplatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseIntIdPipe()) id: number,
    @Body() dto: UpdateCardTemplateDto,
  ) {
    return this.cardTemplatesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseIntIdPipe()) id: number) {
    return this.cardTemplatesService.remove(id);
  }
}
