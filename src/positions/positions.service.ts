import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePositionDto) {
    return this.prisma.position.create({
      data: {
        name: dto.name,
      },
    });
  }

  async findAll() {
    return this.prisma.position.findMany();
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
