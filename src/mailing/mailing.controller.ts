import { Controller, Get, Patch, Body, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Roles } from '../common/guards/roles.guard';
import { UpdateMailingSettingsDto } from './dto/update-mailing-settings.dto';
import { MailingService } from './mailing.service'; // Если в отдельном файле

@Controller('mailing-settings')
@Roles('hr')
export class MailingController {
  constructor(
    private prisma: PrismaService,
    private mailingService: MailingService,
  ) {}

  @Get()
  async get() {
    return this.prisma.mailingSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        sendTime: '09:00',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpPass: '',
        fromEmail: '',
        retryAttempts: 3,
      },
    });
  }

  @Patch()
  async update(@Body() dto: UpdateMailingSettingsDto) {
    // Фильтруем только определённые поля (убираем undefined)
    const data: Partial<UpdateMailingSettingsDto> = {};
    if (dto.sendTime !== undefined) data.sendTime = dto.sendTime;
    if (dto.smtpHost !== undefined) data.smtpHost = dto.smtpHost;
    if (dto.smtpPort !== undefined) data.smtpPort = dto.smtpPort;
    if (dto.smtpUser !== undefined) data.smtpUser = dto.smtpUser;
    if (dto.smtpPass !== undefined) data.smtpPass = dto.smtpPass;
    if (dto.fromEmail !== undefined) data.fromEmail = dto.fromEmail;
    if (dto.retryAttempts !== undefined) data.retryAttempts = dto.retryAttempts;

    return this.prisma.mailingSettings.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        sendTime: dto.sendTime ?? '09:00',
        smtpHost: dto.smtpHost ?? '',
        smtpPort: dto.smtpPort ?? 587,
        smtpUser: dto.smtpUser ?? '',
        smtpPass: dto.smtpPass ?? '',
        fromEmail: dto.fromEmail ?? '',
        retryAttempts: dto.retryAttempts ?? 3,
      },
    });
  }
  @Post('test-send')
  @Roles('hr')
  async testSend() {
    await this.mailingService.handleBirthdayMailing();
    return { message: 'Тестовая рассылка запущена' };
  }
}
