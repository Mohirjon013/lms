import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
  .setTitle('lms docs')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
