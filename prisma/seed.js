const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Создаем роль HR если не существует
  const hrRole = await prisma.role.upsert({
    where: { name: 'hr' },
    update: {},
    create: { name: 'hr' },
  });
  console.log('HR role created/updated:', hrRole);

  // Создаем роль Employee если не существует
  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: { name: 'employee' },
  });
  console.log('Employee role created/updated:', employeeRole);

  // Создаем HR пользователя
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@company.com' },
    update: {},
    create: {
      email: 'hr@company.com',
      password: hashedPassword,
      roleId: hrRole.id,
    },
  });
  console.log('HR user created/updated:', { email: hrUser.email });

  // Создаем профиль сотрудника для HR
  const hrEmployee = await prisma.employee.upsert({
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
  console.log('HR employee profile created/updated:', {
    name: `${hrEmployee.firstName} ${hrEmployee.lastName}`,
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });