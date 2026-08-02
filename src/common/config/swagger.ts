import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
  .setTitle('lms docs')
  .setDescription('The cats API description')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
