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
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateUserEmployeeDto } from './dto/create-user-employee.dto';
import { Roles } from '../common/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ParseIntIdPipe } from '../common/pipes/parse-int-id.pipe';

@Controller('employees')
export class EmployeesController {
  private readonly photosDir = path.join(process.cwd(), 'public', 'photos');

  constructor(
    private readonly employeesService: EmployeesService,
    private prisma: PrismaService,
  ) {
    // Создаем папку для фото если её нет
    if (!fs.existsSync(this.photosDir)) {
      fs.mkdirSync(this.photosDir, { recursive: true });
    }
  }

  // Просмотр своих данных — любой авторизованный сотрудник
  @Get('me/profile')
  async getMyProfile(@Request() req: any) {
    // req.user добавляется JwtAuthGuard
    return this.employeesService.findMyProfile(req.user.id);
  }



  // Обновление профиля — любой авторизованный сотрудник
  @Patch('me/profile')
  async updateMyProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.employeesService.updateProfile(req.user.id, dto);
  }

  // Загрузка фото профиля — любой авторизованный сотрудник
  @Post('me/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(process.cwd(), 'public', 'photos'));
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `employee_${(req as any).user.id}_${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Только изображения разрешены'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  async uploadMyPhoto(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    try {
      // Получаем ID пользователя из токена
      const userId = req.user.id;
      
      // Находим сотрудника по userId
      const employee = await this.prisma.employee.findUnique({
        where: { userId },
      });
      
      if (!employee) {
        throw new Error('Сотрудник не найден');
      }
      
      // Удаляем старое фото если оно есть
      if (employee.photoUrl) {
        const oldPhotoPath = path.join(process.cwd(), employee.photoUrl.replace('http://localhost:3000', ''));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      // Сохраняем новый URL
      const photoUrl = `http://localhost:3000/photos/${file.filename}`;
      await this.employeesService.updateProfile(userId, { photoUrl });
      
      return { message: 'Фото успешно загружено', photoUrl };
    } catch (error) {
      // Удаляем загруженный файл в случае ошибки
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  // Удаление фото профиля — любой авторизованный сотрудник
  @Delete('me/photo')
  async deleteMyPhoto(@Request() req: any) {
    const userId = req.user.id;
    
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
    });
    
    if (!employee) {
      throw new Error('Сотрудник не найден');
    }
    
    if (employee.photoUrl) {
      const photoPath = path.join(process.cwd(), employee.photoUrl.replace('http://localhost:3000', ''));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    await this.employeesService.updateProfile(userId, { photoUrl: null });
    return { message: 'Фото удалено' };
  }

  // Получение настроек уведомлений
  @Get('me/notification-settings')
  async getMyNotificationSettings(@Request() req: any) {
    return this.employeesService.getNotificationSettings(req.user.id);
  }

  // Обновление настроек уведомлений
  @Patch('me/notification-settings')
  async updateMyNotificationSettings(
    @Request() req: any,
    @Body() body: { receiveEmail: boolean },
  ) {
    return this.employeesService.updateNotificationSettings(
      req.user.id,
      body.receiveEmail,
    );
  }

  // Смена пароля
  @Post('me/change-password')
  async changeMyPassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.employeesService.updatePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  // Только HR
  @Roles('hr')
  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  // Создание пользователя и сотрудника вместе (только HR)
  @Roles('hr')
  @Post('create-with-user')
  async createWithUser(@Body() dto: CreateUserEmployeeDto) {
    return this.employeesService.createUserAndEmployee(dto);
  }

  // Только HR
  @Roles('hr')
  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  // Доступно всем авторизованным (для календаря и списка коллег)
  @Get('birthdays')
  getBirthdays(
    @Query('departmentId') departmentId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('period') period?: 'today' | 'week' | 'month' | 'all'
  ) {
    const filters: any = {};
    
    if (departmentId) filters.departmentId = parseInt(departmentId);
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (period) filters.period = period;
    
    return this.employeesService.getBirthdayList(filters);
  }

  @Get('birthday-history')
  @Roles('hr')
  async getBirthdayHistory() {
    try {
      const history = await this.prisma.birthdayCardHistory.findMany({
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          template: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { sentAt: 'desc' },
      });

      return history;
    } catch (error) {
      // Возвращаем пустой массив если таблица не существует
      return [];
    }
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
