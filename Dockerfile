FROM node:22-alpine

# Установка зависимых пакетов
RUN apk add --no-cache python3 make g++

# Создаем директорию приложения
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Строим приложение
RUN npm run build

# Открываем порт
EXPOSE 1337

# Запускаем Strapi
CMD ["npm", "run", "start"]