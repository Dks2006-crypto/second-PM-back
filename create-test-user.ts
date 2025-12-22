import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Создание тестового HR пользователя...');

  // Создаем роли если их нет
  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: { name: 'employee' },
  });

  const hrRole = await prisma.role.upsert({
    where: { name: 'hr' },
    update: {},
    create: { name: 'hr' },
  });

  console.log('Роли созданы:', { employeeRole, hrRole });

  // Создаем HR пользователя
  const hrEmail = 'hr@test.com';
  const hrPassword = 'password123';

  const hashedPassword = await bcrypt.hash(hrPassword, 10);

  const hrUser = await prisma.user.upsert({
    where: { email: hrEmail },
    update: {},
    create: {
      email: hrEmail,
      password: hashedPassword,
      roleId: hrRole.id,
    },
    include: { role: true },
  });

  console.log('HR пользователь создан:', {
    id: hrUser.id,
    email: hrUser.email,
    role: hrUser.role.name,
  });

  // Создаем обычного сотрудника для тестирования
  const employeeEmail = 'employee@test.com';
  const employeePassword = 'password123';

  const employeeHashedPassword = await bcrypt.hash(employeePassword, 10);

  const employeeUser = await prisma.user.upsert({
    where: { email: employeeEmail },
    update: {},
    create: {
      email: employeeEmail,
      password: employeeHashedPassword,
      roleId: employeeRole.id,
    },
    include: { role: true },
  });

  console.log('Сотрудник создан:', {
    id: employeeUser.id,
    email: employeeUser.email,
    role: employeeUser.role.name,
  });

  console.log('\nТестовые учетные данные:');
  console.log('HR:');
  console.log('  Email: hr@test.com');
  console.log('  Password: password123');
  console.log('Сотрудник:');
  console.log('  Email: employee@test.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
