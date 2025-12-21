import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardTemplateDto } from './dto/create-card-template.dto';
import { UpdateCardTemplateDto } from './dto/update-card-template.dto';

@Injectable()
export class CardTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCardTemplateDto) {
    return this.prisma.cardTemplate.create({
      data: dto,
      include: {
        department: true,
        position: true,
      },
    });
  }

  async findAll() {
    return this.prisma.cardTemplate.findMany({
      include: {
        department: true,
        position: true,
      },
    });
  }

  async findOne(id: number) {
    const template = await this.prisma.cardTemplate.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
      },
    });
    if (!template) {
      throw new NotFoundException('Шаблон не найден');
    }
    return template;
  }

  async update(id: number, dto: UpdateCardTemplateDto) {
    return this.prisma.cardTemplate.update({
      where: { id },
      data: dto,
      include: {
        department: true,
        position: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.cardTemplate.delete({
      where: { id },
    });
  }
}
