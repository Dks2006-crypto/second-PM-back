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
import { PositionsService } from './positions.service';
import { Roles } from '../common/guards/roles.guard';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ParseIntIdPipe } from '../common/pipes/parse-int-id.pipe';

@Controller('positions')
@Roles('hr')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  create(@Body() dto: CreatePositionDto) {
    return this.positionsService.create(dto);
  }

  @Get()
  findAll() {
    return this.positionsService.findAll();
  }

  @Get('with-departments')
  findAllWithDepartments() {
    return this.positionsService.findAllWithDepartments();
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntIdPipe()) id: number) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseIntIdPipe()) id: number,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseIntIdPipe()) id: number) {
    return this.positionsService.remove(id);
  }
}
