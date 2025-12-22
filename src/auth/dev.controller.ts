import { Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Public } from '../common/public.decorator';

@Controller('dev')
export class DevController {
  constructor(private prisma: PrismaService) {}

  @Post('create-test-users')
  @Public()
  async createTestUsers() {
    try {
      // Создаем роли если их нет
      const employeeRole = await this.prisma.role.upsert({
        where: { name: 'employee' },
        update: {},
        create: { name: 'employee' },
      });

      const hrRole = await this.prisma.role.upsert({
        where: { name: 'hr' },
        update: {},
        create: { name: 'hr' },
      });

      // Создаем HR пользователя
      const hrEmail = 'hr@test.com';
      const hrPassword = 'password123';
      const hashedPassword = await bcrypt.hash(hrPassword, 10);

      const hrUser = await this.prisma.user.upsert({
        where: { email: hrEmail },
        update: {},
        create: {
          email: hrEmail,
          password: hashedPassword,
          roleId: hrRole.id,
        },
        include: { role: true },
      });

      // Создаем обычного сотрудника для тестирования
      const employeeEmail = 'employee@test.com';
      const employeePassword = 'password123';
      const employeeHashedPassword = await bcrypt.hash(employeePassword, 10);

      const employeeUser = await this.prisma.user.upsert({
        where: { email: employeeEmail },
        update: {},
        create: {
          email: employeeEmail,
          password: employeeHashedPassword,
          roleId: employeeRole.id,
        },
        include: { role: true },
      });

      return {
        message: 'Тестовые пользователи созданы',
        users: [
          {
            id: hrUser.id,
            email: hrUser.email,
            role: hrUser.role.name,
          },
          {
            id: employeeUser.id,
            email: employeeUser.email,
            role: employeeUser.role.name,
          },
        ],
        credentials: {
          hr: { email: 'hr@test.com', password: 'password123' },
          employee: { email: 'employee@test.com', password: 'password123' },
        },
      };
    } catch (error) {
      return {
        error: 'Ошибка при создании пользователей',
        details: error.message,
      };
    }
  }
}