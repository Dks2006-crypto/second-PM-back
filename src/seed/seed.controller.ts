import { Controller, Get, HttpCode } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/public.decorator';
import * as bcrypt from 'bcrypt';

@Controller('seed')
@Public() // Добавьте декоратор на весь контроллер
export class SeedController {
  constructor(private prisma: PrismaService) {}

  @Get('init')
  @HttpCode(200)
  async seedDatabase() {
    try {
      // Создаем роль HR
      const hrRole = await this.prisma.role.upsert({
        where: { name: 'hr' },
        update: {},
        create: { name: 'hr' },
      });

      // Создаем роль Employee
      const employeeRole = await this.prisma.role.upsert({
        where: { name: 'employee' },
        update: {},
        create: { name: 'employee' },
      });

      // Создаем HR пользователя
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const hrUser = await this.prisma.user.upsert({
        where: { email: 'hr@company.com' },
        update: {},
        create: {
          email: 'hr@company.com',
          password: hashedPassword,
          roleId: hrRole.id,
        },
      });

      // Создаем профиль сотрудника для HR
      await this.prisma.employee.upsert({
        where: { userId: hrUser.id },
        update: {},
        create: {
          firstName: 'HR',
          lastName: 'Administrator',
          birthDate: new Date('1990-01-01'),
          email: 'hr@company.com',
          userId: hrUser.id,
        },
      });

      return {
        success: true,
        message: 'Database seeded successfully! 🎉',
        credentials: {
          email: 'hr@company.com',
          password: 'admin123',
          note: 'Please change password after first login',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Seed failed ❌',
        error: error.message,
      };
    }
  }
}
