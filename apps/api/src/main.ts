import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  // rawBody нужен для проверки подписи вебхуков платежей
  const app = await NestFactory.create(AppModule, { rawBody: true })
  app.setGlobalPrefix('api')

  // CORS: только явный whitelist, без '*' при credentials
  const origins = (process.env.CORS_ORIGIN ?? 'https://mooni.suspectuso.ru')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
  const port = Number(process.env.API_PORT ?? 8001)
  await app.listen(port)
}

bootstrap()
