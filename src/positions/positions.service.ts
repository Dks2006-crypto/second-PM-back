import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

interface PositionDepartmentLink {
  positionId: number;
  departmentId: number;
  positionName: string;
}

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePositionDto) {
    const position = await this.prisma.position.create({
      data: {
        name: dto.name,
      },
    });

    // Если указан departmentId, создаем связь через NotificationLog
    if (dto.departmentId) {
      try {
        // Сохраняем связь в NotificationLog
        await this.prisma.notificationLog.create({
          data: {
            type: 'POSITION_DEPARTMENT_LINK',
            message: JSON.stringify({
              positionId: position.id,
              departmentId: dto.departmentId,
              positionName: position.name,
            }),
          },
        });
      } catch (error) {
        // Если не удалось создать запись, продолжаем без связи
        console.warn('Не удалось установить связь с отделом:', error);
      }
    }

    return position;
  }

  async findAll() {
    return this.prisma.position.findMany();
  }

  async findAllWithDepartments() {
    const positions = await this.prisma.position.findMany();
    const links = await this.prisma.notificationLog.findMany({
      where: {
        type: 'POSITION_DEPARTMENT_LINK',
      },
    });

    // Создаем карту связей
    const linksMap = new Map<number, any>();
    links.forEach((link) => {
      try {
        const data = JSON.parse(link.message) as PositionDepartmentLink;
        linksMap.set(data.positionId, data);
      } catch (error) {
        console.warn('Ошибка парсинга ссылки:', error);
      }
    });

    // Получаем отделы для связанных должностей
    const departmentIds = Array.from(linksMap.values()).map((link: any) => link.departmentId);
    const uniqueDepartmentIds = [...new Set(departmentIds)];
    
    const departments = await this.prisma.department.findMany({
      where: {
        id: {
          in: uniqueDepartmentIds,
        },
      },
    });

    const departmentsMap = new Map<number, any>();
    departments.forEach((dept) => {
      departmentsMap.set(dept.id, dept);
    });

    // Обогащаем позиции данными об отделах
    return positions.map((position) => {
      const link = linksMap.get(position.id);
      const department = link ? departmentsMap.get(link.departmentId) : null;
      
      return {
        ...position,
        CardTemplate: department
          ? [
              {
                id: 0,
                departmentId: department.id,
                department: {
                  id: department.id,
                  name: department.name,
                },
              },
            ]
          : [],
      };
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
