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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Roles } from '../common/guards/roles.guard';
import { ParseIntIdPipe } from '../common/pipes/parse-int-id.pipe';

@Controller('departments')
@Roles('hr')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseIntIdPipe()) id: number) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseIntIdPipe()) id: number,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseIntIdPipe()) id: number) {
    return this.departmentsService.remove(id);
  }
}
