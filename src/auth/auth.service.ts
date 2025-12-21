import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role.name,
    };
  }

  async register(dto: RegisterDto) {
    // Регистрацию может выполнять только существующий HR (проверим в guard позже)
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    const role = await this.prisma.role.findUnique({
      where: { name: dto.role },
    });
    if (!role) {
      throw new BadRequestException('Неверная роль');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        roleId: role.id,
      },
      include: { role: true },
    });

    const payload = { sub: user.id, email: user.email, role: user.role.name };
    return {
      access_token: this.jwtService.sign(payload),
      role: user.role.name,
    };
  }

  // Метод для инициализации ролей (вызовем в main.ts)
  async seedRoles() {
    const roles = ['employee', 'hr'];
    for (const name of roles) {
      await this.prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
  }
}