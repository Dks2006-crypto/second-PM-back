import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CardGeneratorService } from '../card-generator/card-generator.service';
import * as nodemailer from 'nodemailer';
import { CardTemplate, Employee } from '@prisma/client';

@Injectable()
export class MailingService {
  private readonly logger = new Logger(MailingService.name);

  constructor(
    private prisma: PrismaService,
    private cardGenerator: CardGeneratorService,
  ) {}

  @Cron('*/1 * * * *')
  async handleBirthdayMailing() {
    this.logger.log('handleBirthdayMailing вызван! (проверка времени)');

    const settings = await this.prisma.mailingSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      this.logger.error('Настройки рассылки не найдены');
      return;
    }

    const now = new Date();
    const [targetHour, targetMinute] = settings.sendTime.split(':').map(Number);

    // Проверяем, совпадает ли текущее время с настроенным
    if (now.getHours() !== targetHour || now.getMinutes() !== targetMinute) {
      return; // Не время — выходим
    }

    this.logger.log(`Время отправки наступило: ${settings.sendTime}`);

    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    const allEmployees = await this.prisma.employee.findMany({
      where: {
        OR: [{ preferences: { receiveEmail: true } }, { preferences: null }],
      },
      include: { department: true, position: true },
    });

    const employees = allEmployees.filter(emp => {
      const birth = new Date(emp.birthDate);
      return birth.getMonth() === todayMonth && birth.getDate() === todayDay;
    });

    this.logger.log(`Найдено ${employees.length} сотрудников с ДР сегодня`);

    if (employees.length === 0) {
      this.logger.log('Сегодня нет дней рождения');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: false,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
      logger: true,
      debug: true,
    });

    const fromEmail = settings.fromEmail || 'birthday@company.app';

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      await this.sendBirthdayCard(employee, transporter, fromEmail);

      if (i < employees.length - 1) {
        this.logger.log('Задержка 2 секунды для соблюдения лимита Mailtrap');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  private async sendBirthdayCard(
    employee: Employee & {
      department?: { id: number } | null;
      position?: { id: number } | null;
    },
    transporter: nodemailer.Transporter,
    fromEmail: string,
  ) {
    let template: CardTemplate | null = null;
    let templateIdForHistory = 0;

    try {
      // Получаем все подходящие шаблоны
      let availableTemplates: CardTemplate[] = [];
      
      if (employee.departmentId) {
        const departmentTemplates = await this.prisma.cardTemplate.findMany({
          where: { departmentId: employee.departmentId },
        });
        availableTemplates.push(...departmentTemplates);
      }

      if (employee.positionId) {
        const positionTemplates = await this.prisma.cardTemplate.findMany({
          where: { positionId: employee.positionId },
        });
        availableTemplates.push(...positionTemplates);
      }

      // Если нет специализированных шаблонов, берем все общие
      if (availableTemplates.length === 0) {
        availableTemplates = await this.prisma.cardTemplate.findMany({
          where: {
            departmentId: null,
            positionId: null,
          },
        });
      }

      // Если все еще нет шаблонов, берем любые
      if (availableTemplates.length === 0) {
        availableTemplates = await this.prisma.cardTemplate.findMany();
      }

      if (availableTemplates.length === 0) {
        throw new Error('Нет доступных шаблонов открыток');
      }

      // Выбираем случайный шаблон из доступных
      const randomIndex = Math.floor(Math.random() * availableTemplates.length);
      template = availableTemplates[randomIndex];

      templateIdForHistory = template.id;

      const fullName = `${employee.firstName} ${employee.lastName}`;
      const imageUrl = await this.cardGenerator.generateCard(
        template,
        fullName,
        employee.photoUrl || undefined,
        true, // включаем фото сотрудника
      );

      // imageUrl уже содержит полный URL, не нужно добавлять префикс
      this.logger.log(`Отправка письма на ${employee.email} от ${fromEmail} с шаблоном "${template.name}"`);

      await transporter.sendMail({
        from: fromEmail,
        to: employee.email,
        subject: 'С Днем рождения!',
        html: `
          <p>Дорогой ${fullName}!</p>
          <p>Поздравляем с Днем рождения!</p>
          <p><img src="${imageUrl}" alt="Поздравительная открытка" style="max-width: 100%; height: auto;" /></p>
        `,
      });

      await this.prisma.birthdayCardHistory.create({
        data: {
          employeeId: employee.id,
          templateId: template.id,
          imageUrl,
          sentAt: new Date(),
          success: true,
        },
      });

      this.logger.log(`Открытка успешно отправлена: ${employee.email} (шаблон: ${template.name})`);
    } catch (error: any) {
      this.logger.error(`Ошибка отправки ${employee.email}: ${error.message}`);

      await this.prisma.birthdayCardHistory.create({
        data: {
          employeeId: employee.id,
          templateId: templateIdForHistory,
          imageUrl: '',
          sentAt: new Date(),
          success: false,
          errorMessage: error.message,
        },
      });

      await this.prisma.notificationLog.create({
        data: {
          type: 'send_error',
          message: `Ошибка отправки сотруднику ID ${employee.id} (${employee.email}): ${error.message}`,
        },
      });
    }
  }
}
