import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Roles } from '../common/guards/roles.guard';
import { Public } from '../common/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ParseIntIdPipe } from '../common/pipes/parse-int-id.pipe';

@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private prisma: PrismaService,
  ) {}

  // Только HR
  @Roles('hr')
  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  // Только HR
  @Roles('hr')
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  // Доступно всем авторизованным (для календаря и списка коллег)
  @Get('birthdays')
  getBirthdays() {
    return this.employeesService.getBirthdayList();
  }

  // Просмотр конкретного сотрудника — только HR или сам сотрудник
  @Get(':id')
  async findOne(@Param('id', new ParseIntIdPipe()) id: number, @Request() req) {
    if (req.user.role === 'hr') {
      return this.employeesService.findOne(id);
    }

    // Если не HR — проверяем, что это его профиль
    const employee = await this.employeesService.findOne(id);
    if (employee.userId !== req.user.id) {
      throw new ForbiddenException('Доступ запрещен');
    }
    return employee;
  }

  // Просмотр своих данных — любой авторизованный сотрудник
  @Get('me/profile')
  async getMyProfile(@Request() req: any) {
    // req.user добавляется JwtAuthGuard
    return this.employeesService.findMyProfile(req.user.id);
  }

  @Get('birthday-history')
  @Roles('hr')
  async getBirthdayHistory() {
    return this.prisma.birthdayCardHistory.findMany({
      include: {
        employee: {
          select: { firstName: true, lastName: true, email: true },
        },
        template: {
          select: { name: true },
        },
      },
      orderBy: { sentAt: 'desc' },
    });
  }

  // Только HR
  @Roles('hr')
  @Patch(':id')
  update(
    @Param('id', new ParseIntIdPipe()) id: number,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto);
  }

  // Только HR
  @Roles('hr')
  @Delete(':id')
  remove(@Param('id', new ParseIntIdPipe()) id: number) {
    return this.employeesService.remove(id);
  }
}
