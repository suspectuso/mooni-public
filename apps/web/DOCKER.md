# Frontend Docker Deployment

## Сборка и запуск

### 1. Настройте .env.local файл

Убедитесь что `.env.local` содержит:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Для продакшена:

```env
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### 2. Соберите и запустите контейнер

```bash
docker-compose up -d --build
```

### 3. Проверьте статус

```bash
docker-compose ps
```

### 4. Просмотр логов

```bash
docker-compose logs -f
```

## Команды

### Запуск

```bash
docker-compose up -d
```

### Остановка

```bash
docker-compose down
```

### Перезапуск

```bash
docker-compose restart
```

### Пересборка

```bash
docker-compose up -d --build
```

## Порт

- **3000** - Frontend приложение

## Примечания

- Убедитесь что backend доступен по адресу из NEXT_PUBLIC_API_URL
- Приложение собирается в standalone режиме для оптимизации размера
