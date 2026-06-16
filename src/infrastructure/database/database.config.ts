import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: () => ({
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    username: process.env.MYSQL_USER || 'payment',
    password: process.env.MYSQL_PASSWORD || 'payment_password',
    database: process.env.MYSQL_DATABASE || 'payment_db',
    autoLoadEntities: true,
    synchronize: false,
    timezone: 'Z',
    charset: 'utf8mb4',
    extra: { connectionLimit: 30 }
  })
};
