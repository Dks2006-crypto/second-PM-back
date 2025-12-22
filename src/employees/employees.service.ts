import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserEmployeeDto } from './dto/create-user-employee.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  // CRUD только для HR
  async create(dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ForbiddenException('Сотрудник с таким email уже существует');
    }

    // Преобразуем YYYY-MM-DD в полный ISO с временем 00:00:00Z
    const birthDate = new Date(dto.birthDate);
    if (isNaN(birthDate.getTime())) {
      throw new ForbiddenException('Некорректная дата рождения');
    }
    // Устанавливаем время на полночь UTC
    birthDate.setUTCHours(0, 0, 0, 0);

    return this.prisma.employee.create({
      data: {
        ...dto,
        birthDate: birthDate.toISOString(), // Теперь правильный формат
      },
      include: {
        department: true,
        position: true,
        user: { select: { email: true, role: { select: { name: true } } } },
      },
    });
  }

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        department: true,
        position: true,
      },
    });
  }

  async findOne(id: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
      },
    });
    if (!employee) {
      throw new NotFoundException('Сотрудник не найден');
    }
    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    return this.prisma.employee.update({
      where: { id },
      data: dto,
      include: {
        department: true,
        position: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }

  // Специальный метод для сотрудника — просмотр своих данных
  async findMyProfile(userId: number) {
    let employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        department: true,
        position: true,
        preferences: true,
        BirthdayCardHistory: {
          take: 5,
          orderBy: { sentAt: 'desc' },
          include: {
            template: { select: { name: true } },
          },
        },
      },
    });

    // Если профиль не существует, создаем базовый
    if (!employee) {
      // Получаем данные пользователя
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (user) {
        // Создаем базовый Employee профиль
        employee = await this.prisma.employee.create({
          data: {
            firstName: 'Новый',
            lastName: 'Сотрудник',
            email: user.email,
            birthDate: new Date('1990-01-01').toISOString(),
            userId: userId,
          },
          include: {
            department: true,
            position: true,
            preferences: true,
            BirthdayCardHistory: {
              take: 5,
              orderBy: { sentAt: 'desc' },
              include: {
                template: { select: { name: true } },
              },
            },
          },
        });
      }
    }

    if (!employee) {
      throw new NotFoundException('Ваш профиль сотрудника не найден');
    }

    return employee;
  }

  // Для календаря дней рождения (доступно всем авторизованным)
  async getBirthdayList(filters?: {
    departmentId?: number;
    dateFrom?: string; // YYYY-MM-DD
    dateTo?: string;   // YYYY-MM-DD
    period?: 'today' | 'week' | 'month' | 'all';
  }) {
    const whereClause: any = {};
    
    // Фильтр по отделу
    if (filters?.departmentId) {
      whereClause.departmentId = filters.departmentId;
    }

    const employees = await this.prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        department: { select: { name: true } },
      },
    });

    // Фильтрация по датам
    let filteredEmployees = employees;
    
    if (filters?.period || filters?.dateFrom || filters?.dateTo) {
      const today = new Date();
      
      filteredEmployees = employees.filter(emp => {
        const birthDate = new Date(emp.birthDate);
        const thisYearBirth = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        
        // Период фильтрации
        if (filters?.period) {
          switch (filters.period) {
            case 'today':
              return thisYearBirth.toDateString() === today.toDateString();
            
            case 'week': {
              const weekFrom = new Date(today);
              weekFrom.setDate(today.getDate());
              const weekTo = new Date(today);
              weekTo.setDate(today.getDate() + 7);
              return thisYearBirth >= weekFrom && thisYearBirth <= weekTo;
            }
            
            case 'month': {
              const monthFrom = new Date(today.getFullYear(), today.getMonth(), 1);
              const monthTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
              return thisYearBirth >= monthFrom && thisYearBirth <= monthTo;
            }
          }
        }
        
        // Конкретные даты
        if (filters?.dateFrom || filters?.dateTo) {
          const dateFrom = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
          const dateTo = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
          
          return thisYearBirth >= dateFrom && thisYearBirth <= dateTo;
        }
        
        return true;
      });
    }

    // Сортируем по дню и месяцу рождения (игнорируя год)
    return filteredEmployees.sort((a, b) => {
      const dateA = new Date(a.birthDate);
      const dateB = new Date(b.birthDate);
      
      // Извлекаем только месяц и день
      const monthDayA = dateA.getMonth() * 100 + dateA.getDate();
      const monthDayB = dateB.getMonth() * 100 + dateB.getDate();
      
      return monthDayA - monthDayB;
    });
  }

  // Обновление профиля сотрудника
  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Профиль сотрудника не найден');
    }

    const updateData: Partial<{
      firstName: string;
      lastName: string;
      photoUrl: string;
      birthDate: string;
    }> = {};

    // Обновляем личные данные сотрудника
    if (dto.firstName) updateData.firstName = dto.firstName;
    if (dto.lastName) updateData.lastName = dto.lastName;
    if (dto.photoUrl) updateData.photoUrl = dto.photoUrl;
    if (dto.birthDate) {
      const birthDate = new Date(dto.birthDate);
      if (isNaN(birthDate.getTime())) {
        throw new ForbiddenException('Некорректная дата рождения');
      }
      birthDate.setUTCHours(0, 0, 0, 0);
      updateData.birthDate = birthDate.toISOString();
    }

    // Обновляем данные сотрудника
    const updatedEmployee = await this.prisma.employee.update({
      where: { id: employee.id },
      data: updateData,
      include: {
        department: true,
        position: true,
        preferences: true,
      },
    });

    // Обновляем настройки уведомлений
    const preferencesUpdate: Partial<{
      receiveEmail: boolean;
      receiveInApp: boolean;
      reminderDaysBefore: number;
      sendTime: string;
      showBirthdayPublic: boolean;
      allowCardPersonalization: boolean;
    }> = {};
    
    if (dto.receiveEmail !== undefined) preferencesUpdate.receiveEmail = dto.receiveEmail;
    if (dto.receiveInApp !== undefined) preferencesUpdate.receiveInApp = dto.receiveInApp;
    if (dto.reminderDaysBefore !== undefined) preferencesUpdate.reminderDaysBefore = dto.reminderDaysBefore;
    if (dto.sendTime !== undefined) preferencesUpdate.sendTime = dto.sendTime;
    if (dto.showBirthdayPublic !== undefined) preferencesUpdate.showBirthdayPublic = dto.showBirthdayPublic;
    if (dto.allowCardPersonalization !== undefined) preferencesUpdate.allowCardPersonalization = dto.allowCardPersonalization;
    
    if (Object.keys(preferencesUpdate).length > 0) {
      await this.prisma.birthdayPreferences.upsert({
        where: { employeeId: employee.id },
        update: preferencesUpdate,
        create: {
          employeeId: employee.id,
          ...preferencesUpdate,
        },
      });
    }

    // Меняем пароль если указан
    if (dto.currentPassword && dto.newPassword) {
      if (!employee.user) {
        throw new NotFoundException('Данные пользователя не найдены');
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        employee.user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Неверный текущий пароль');
      }

      const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
      await this.prisma.user.update({
        where: { id: employee.user.id },
        data: { password: hashedNewPassword },
      });
    }

    return updatedEmployee;
  }

  // Получение настроек уведомлений
  async getNotificationSettings(userId: number) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: { preferences: true },
    });

    if (!employee) {
      throw new NotFoundException('Профиль сотрудника не найден');
    }

    return employee.preferences || { receiveEmail: true };
  }

  // Обновление только настроек уведомлений
  async updateNotificationSettings(userId: number, receiveEmail: boolean) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });

    if (!employee) {
      throw new NotFoundException('Профиль сотрудника не найден');
    }

    return this.prisma.birthdayPreferences.upsert({
      where: { employeeId: employee.id },
      update: { receiveEmail },
      create: {
        employeeId: employee.id,
        receiveEmail,
      },
    });
  }

  // Смена пароля
  async updatePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!employee || !employee.user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      employee.user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Неверный текущий пароль');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: employee.user.id },
      data: { password: hashedNewPassword },
    });

    return { message: 'Пароль успешно изменен' };
  }

  // Создание пользователя и сотрудника вместе
  async createUserAndEmployee(dto: CreateUserEmployeeDto) {
    // Проверяем, что пользователь с таким email не существует
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ForbiddenException('Пользователь с таким email уже существует');
    }

    // Проверяем роль
    const role = await this.prisma.role.findUnique({
      where: { name: dto.role },
    });

    if (!role) {
      throw new ForbiddenException('Неверная роль');
    }

    // Проверяем дату рождения
    const birthDate = new Date(dto.birthDate);
    if (isNaN(birthDate.getTime())) {
      throw new ForbiddenException('Некорректная дата рождения');
    }
    birthDate.setUTCHours(0, 0, 0, 0);

    // Создаем пользователя
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        roleId: role.id,
      },
      include: { role: true },
    });

    // Создаем сотрудника
    const employee = await this.prisma.employee.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        birthDate: birthDate.toISOString(),
        photoUrl: dto.photoUrl,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        userId: user.id,
      },
      include: {
        department: true,
        position: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        department: employee.department,
        position: employee.position,
      },
    };
  }
}
