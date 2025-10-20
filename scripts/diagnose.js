const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';

async function diagnose() {
    console.log('🔍 Диагностика Strapi...\n');

    // Проверка базового URL
    console.log('1. Проверка базового URL:');
    try {
        const response = await axios.get(STRAPI_URL, { timeout: 5000 });
        console.log('   ✅ Strapi отвечает');
        console.log('   Status:', response.status);
    } catch (error) {
        console.log('   ❌ Strapi не отвечает:', error.message);
        console.log('\n💡 Решение: Запустите Strapi командой: npm run develop');
        return;
    }

    // Проверка health endpoint
    console.log('\n2. Проверка health check:');
    try {
        const response = await axios.get(`${STRAPI_URL}/_health`, { timeout: 5000 });
        console.log('   ✅ Health check OK');
        console.log('   Status:', response.status);
        console.log('   Data:', response.data);
    } catch (error) {
        console.log('   ⚠️ Health check недоступен:', error.message);
    }

    // Проверка API
    console.log('\n3. Проверка REST API:');
    const endpoints = ['/api/categories', '/api/authors', '/api/news-items'];

    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`${STRAPI_URL}${endpoint}`, {
                timeout: 5000,
                validateStatus: null // Разрешаем все статусы
            });
            console.log(`   ${endpoint}: ${response.status} ${response.statusText}`);
        } catch (error) {
            console.log(`   ${endpoint}: ERROR - ${error.message}`);
        }
    }

    console.log('\n📋 ВЫВОД:');
    console.log('Если все endpoints возвращают 404, значит:');
    console.log('1. Strapi запущен, но контент-типы не созданы');
    console.log('2. Нужно создать контент-типы через Content-Type Builder');
    console.log('3. Или настроить права доступа в панели администратора');
}

diagnose().catch(console.error);