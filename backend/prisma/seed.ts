import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sercamp.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@sercamp.com',
      passwordHash: adminPassword,
      role: 'admin',
      modules: [
        'fotografico',
        'spda',
        'rdo',
        'tecnico',
        'gastos',
        'banco_dados',
        'gerenciar_usuarios'
      ],
      status: 'ativo'
    }
  });

  console.log('✅ Admin user created:', admin.email);

  // Create funcionario user
  const funcionarioPassword = await bcrypt.hash('func123', 10);
  const funcionario = await prisma.user.upsert({
    where: { email: 'funcionario@sercamp.com' },
    update: {
      modules: ['fotografico', 'spda', 'rdo', 'tecnico', 'gastos']
    },
    create: {
      name: 'Funcionário Teste',
      email: 'funcionario@sercamp.com',
      passwordHash: funcionarioPassword,
      role: 'funcionario',
      modules: ['fotografico', 'spda', 'rdo', 'tecnico', 'gastos'],
      status: 'ativo'
    }
  });

  console.log('✅ Funcionario user created:', funcionario.email);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
