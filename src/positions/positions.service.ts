import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePositionDto) {
    const position = await this.prisma.position.create({
      data: {
        name: dto.name,
      },
    });

    // Если указан departmentId, создаем связь через CardTemplate
    if (dto.departmentId) {
      try {
        // Создаем базовый шаблон карты для установки связи
        await this.prisma.cardTemplate.create({
          data: {
            name: `Связь для ${position.name}`,
            textTemplate: 'Связь должности с отделом',
            positionId: position.id,
            departmentId: dto.departmentId,
          },
        });
      } catch (error) {
        // Если не удалось создать шаблон, продолжаем без связи
        console.warn('Не удалось установить связь с отделом:', error);
      }
    }

    return position;
  }

  async findAll() {
    return this.prisma.position.findMany();
  }

  async findAllWithDepartments() {
    return this.prisma.position.findMany({
      include: {
        CardTemplate: {
          select: {
            id: true,
            departmentId: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const position = await this.prisma.position.findUnique({
      where: { id },
    });
    if (!position) {
      throw new NotFoundException('Должность не найдена');
    }
    return position;
  }

  async update(id: number, dto: UpdatePositionDto) {
    return this.prisma.position.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    return this.prisma.position.delete({
      where: { id },
    });
  }
}
