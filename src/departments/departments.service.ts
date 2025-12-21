import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        name: dto.name,
      },
    });
  }

  async findAll() {
    return this.prisma.department.findMany();
  }

  async findOne(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('Отдел не найден');
    }
    return department;
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    return this.prisma.department.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.department.delete({
      where: { id },
    });
  }
}
