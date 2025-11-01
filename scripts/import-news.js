require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

// Конфигурация Strapi
const STRAPI_URL = process.env.PUBLIC_URL;
const API_TOKEN = process.env.APP_STRAPI_TOKEN;

// Функция для детального логирования ошибок
function logErrorDetails(error, context = '') {
    console.log(`🔍 Детали ошибки ${context}:`);

    if (error.response) {
        // Ошибка от сервера
        console.log(`   📡 Статус: ${error.response.status}`);
        console.log(`   📝 Сообщение: ${error.response.statusText}`);
        console.log(`   🔗 URL: ${error.response.config?.url}`);

        if (error.response.data) {
            console.log(`   📊 Данные ответа:`, JSON.stringify(error.response.data, null, 2));
        }
    } else if (error.request) {
        // Ошибка сети
        console.log(`   🌐 Ошибка сети: нет ответа от сервера`);
        console.log(`   🔗 Запрос:`, error.request);
    } else {
        // Другие ошибки
        console.log(`   ⚠️ Ошибка: ${error.message}`);
    }

    if (error.config) {
        console.log(`   📋 Метод: ${error.config.method}`);
        console.log(`   🏷️  Заголовки:`, error.config.headers);
    }
}

// Функция для проверки существования автора
async function checkAuthorExists(authorName) {
    try {
        const response = await axios.get(
            `${STRAPI_URL}/api/authors?filters[name][$eq]=${encodeURIComponent(authorName)}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            }
        );
        return response.data.data.length > 0 ? response.data.data[0].id : null;
    } catch (error) {
        console.log(`❌ Ошибка проверки автора ${authorName}:`);
        logErrorDetails(error, 'checkAuthorExists');
        return null;
    }
}

// Функция для проверки существования категории
async function checkCategoryExists(alias) {
    try {
        const response = await axios.get(
            `${STRAPI_URL}/api/categories?filters[alias][$eq]=${alias}`,
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            }
        );
        return response.data.data.length > 0 ? response.data.data[0].id : null;
    } catch (error) {
        console.log(`❌ Ошибка проверки категории ${alias}:`);
        logErrorDetails(error, 'checkCategoryExists');
        return null;
    }
}

// Функция для извлечения ссылок на изображения из HTML галереи
function extractGalleryUrls(galleryHtml) {
    if (!galleryHtml) {
        console.log('ℹ️  Галерея пустая или отсутствует');
        return [];
    }

    // Регулярное выражение для извлечения ссылок из атрибута href
    const regex = /href="(\/media\/k2\/galleries\/[^"]+\.(jpg|jpeg|png|gif|webp))"/gi;

    const matches = [];
    let match;

    while ((match = regex.exec(galleryHtml)) !== null) {
        // Добавляем полный URL с базовым доменом
        const fullUrl = 'https://www.orgma.ru' + match[1];
        matches.push(fullUrl);
    }

    console.log(`🔍 Извлечено ${matches.length} ссылок из галереи`);

    // Убираем дубликаты
    const uniqueMatches = [...new Set(matches)];
    if (uniqueMatches.length !== matches.length) {
        console.log(`🔄 Убрано ${matches.length - uniqueMatches.length} дубликатов`);
    }

    return uniqueMatches;
}

// Функция для проверки доступности изображения
async function checkImageAvailability(imageUrl) {
    try {
        const response = await axios.head(imageUrl, {
            timeout: 10000,
            validateStatus: function (status) {
                return status < 500; // Принимаем все статусы кроме 5xx
            }
        });

        const isAvailable = response.status === 200;
        console.log(`   📊 Статус изображения ${imageUrl}: ${response.status} ${isAvailable ? '✅' : '❌'}`);

        return {
            available: isAvailable,
            status: response.status,
            contentType: response.headers['content-type'],
            contentLength: response.headers['content-length']
        };
    } catch (error) {
        console.log(`   ❌ Изображение недоступно: ${imageUrl}`);
        return {
            available: false,
            error: error.message
        };
    }
}

// Функция для загрузки одного изображения в Strapi
async function uploadImageToStrapi(imageUrl) {
    try {
        console.log(`🖼️ Загрузка изображения: ${imageUrl}`);

        // Проверяем доступность изображения
        const availability = await checkImageAvailability(imageUrl);
        if (!availability.available) {
            console.log(`   ⏭️ Пропуск: изображение недоступно`);
            return null;
        }

        // Скачиваем изображение
        const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            maxContentLength: 10 * 1024 * 1024 // 10MB limit
        });

        const imageSize = imageResponse.data.length;
        console.log(`   📏 Размер изображения: ${(imageSize / 1024 / 1024).toFixed(2)} MB`);

        // Более строгая проверка размера
        if (imageSize > 8 * 1024 * 1024) { // 8MB для запаса
            console.log(`   ❌ Слишком большой размер: ${(imageSize / 1024 / 1024).toFixed(2)} MB`);
            return null;
        }

        // Создаем FormData
        const FormData = require('form-data');
        const form = new FormData();

        const fileName = imageUrl.split('/').pop() || 'image.jpg';

        // Исправленный способ добавления файла
        form.append('files', imageResponse.data, {
            filename: fileName,
            contentType: imageResponse.headers['content-type'] || 'image/jpeg',
            knownLength: imageSize // Добавляем известную длину
        });

        console.log(`   📤 Отправка в Strapi...`);

        // Загружаем в Strapi с улучшенной обработкой
        const uploadResponse = await axios.post(
            `${STRAPI_URL}/api/upload`,
            form,
            {
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    ...form.getHeaders()
                },
                timeout: 60000, // Увеличиваем таймаут
                maxContentLength: 20 * 1024 * 1024,
                maxBodyLength: 20 * 1024 * 1024
            }
        );

        if (uploadResponse.data && uploadResponse.data.length > 0) {
            console.log(`✅ Изображение загружено: ${uploadResponse.data[0].id}`);
            return uploadResponse.data[0].id;
        } else {
            console.log(`❌ Пустой ответ от Strapi`);
            return null;
        }
    } catch (error) {
        console.log(`❌ Ошибка загрузки изображения ${imageUrl}:`);

        // Более детальная диагностика
        if (error.code === 'ECONNRESET') {
            console.log('   🔌 Ошибка соединения: таймаут или разрыв');
        } else if (error.response?.status === 413) {
            console.log('   📦 Ошибка: слишком большой файл');
        } else if (error.response?.status === 500) {
            console.log('   🖥️  Внутренняя ошибка сервера Strapi');
            // Логируем дополнительные детали
            console.log('   🔍 Проверьте логи Strapi для деталей');
        }

        logErrorDetails(error, 'uploadImageToStrapi');
        return null;
    }
}

// Функция для загрузки изображений галереи в Strapi и получения их ID
async function uploadGalleryImages(imageUrls) {
    const uploadedImageIds = [];

    console.log(`📦 Начало загрузки ${imageUrls.length} изображений галереи`);

    for (const [index, imageUrl] of imageUrls.entries()) {
        try {
            console.log(`\n🖼️ [${index + 1}/${imageUrls.length}] Загрузка изображения галереи`);
            const imageId = await uploadImageToStrapi(imageUrl);
            if (imageId) {
                uploadedImageIds.push(imageId);
                console.log(`✅ Успешно загружено: ${imageId}`);
            } else {
                console.log(`❌ Не удалось загрузить: ${imageUrl}`);
            }

            // Пауза между загрузками
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.log(`❌ Критическая ошибка загрузки изображения галереи ${imageUrl}:`);
            logErrorDetails(error, 'uploadGalleryImages');
        }
    }

    console.log(`🎉 Завершена загрузка галереи: ${uploadedImageIds.length}/${imageUrls.length} успешно`);
    return uploadedImageIds;
}

// Функция для проверки данных перед созданием новости
function validateNewsData(item, categoryId, authorId) {
    const errors = [];

    if (!item.title) errors.push('отсутствует заголовок');
    if (!item.alias) errors.push('отсутствует alias');
    if (!categoryId) errors.push('не найдена категория');
    if (!authorId) errors.push('не найден автор');
    if (!item.created) errors.push('отсутствует дата создания');

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

async function importNews() {
    const failedItems = []; // Для сбора информации о неудачных импортах

    try {
        console.log('🚀 Запуск импорта данных...\n');

        // Проверка подключения к Strapi
        try {
            const healthCheck = await axios.get(`${STRAPI_URL}/api/categories`, {
                headers: { 'Authorization': `Bearer ${API_TOKEN}` },
                timeout: 10000
            });
            console.log('✅ Подключение к Strapi успешно');
            console.log(`   📊 Статус: ${healthCheck.status}`);
        } catch (error) {
            console.log('❌ Ошибка подключения к Strapi:');
            logErrorDetails(error, 'healthCheck');
            return;
        }

        // Чтение данных
        console.log('📖 Чтение файла данных...');
        const jsonData = JSON.parse(fs.readFileSync('./data/data.json', 'utf8'));
        console.log(`📊 Загружено ${jsonData.items.length} новостей из файла`);

        // 1. Создаем категории
        console.log('\n📁 Создание категорий...');
        const categoryMap = new Map();
        const allCategories = [jsonData.category, ...(jsonData.category.children || jsonData.category.chidlren || [])];

        for (const cat of allCategories) {
            const existingCategoryId = await checkCategoryExists(cat.alias);
            if (existingCategoryId) {
                categoryMap.set(cat.id, existingCategoryId);
                console.log(`✅ Найдена существующая категория: ${cat.name} (ID: ${existingCategoryId})`);
                continue;
            }

            const categoryData = {
                data: {
                    name: cat.name,
                    alias: cat.alias,
                    description: cat.description || '',
                    ordering: parseInt(cat.ordering) || 0,
                }
            };

            try {
                console.log(`🔄 Создание категории: ${cat.name}`);
                const response = await axios.post(
                    `${STRAPI_URL}/api/categories`,
                    categoryData,
                    {
                        headers: {
                            'Authorization': `Bearer ${API_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                categoryMap.set(cat.id, response.data.data.id);
                console.log(`✅ Создана: ${cat.name} (ID: ${response.data.data.id})`);
            } catch (error) {
                console.log(`❌ Ошибка создания категории ${cat.name}:`);
                logErrorDetails(error, 'createCategory');
            }
        }

        // 2. Создаем авторов
        console.log('\n👥 Создание авторов...');
        const authorMap = new Map();
        const uniqueAuthors = new Set();

        for (const item of jsonData.items) {
            if (item.author && item.author.name) {
                uniqueAuthors.add(item.author.name);
            }
        }

        console.log(`📊 Найдено уникальных авторов: ${uniqueAuthors.size}`);

        for (const authorName of uniqueAuthors) {
            const existingAuthorId = await checkAuthorExists(authorName);
            if (existingAuthorId) {
                authorMap.set(authorName, existingAuthorId);
                console.log(`✅ Найден существующий автор: ${authorName} (ID: ${existingAuthorId})`);
                continue;
            }

            const authorData = {
                data: {
                    name: authorName,
                }
            };

            try {
                console.log(`🔄 Создание автора: ${authorName}`);
                const response = await axios.post(
                    `${STRAPI_URL}/api/authors`,
                    authorData,
                    {
                        headers: {
                            'Authorization': `Bearer ${API_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                authorMap.set(authorName, response.data.data.id);
                console.log(`✅ Создан автор: ${authorName} (ID: ${response.data.data.id})`);
            } catch (error) {
                console.log(`❌ Ошибка создания автора ${authorName}:`);
                logErrorDetails(error, 'createAuthor');
            }
        }

        // 3. Импортируем новости с изображениями и галереей
        console.log('\n📰 Импорт новостей с изображениями и галереей...');
        let successCount = 0;
        let errorCount = 0;
        let skipCount = 0;

        // Проверка существующих новостей
        console.log('🔍 Проверка существующих новостей...');
        const existingNewsAliases = new Set();
        try {
            const existingNews = await axios.get(
                `${STRAPI_URL}/api/news-items?fields=alias&pagination[pageSize]=1000`,
                {
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`
                    }
                }
            );
            existingNews.data.data.forEach(news => {
                if (news.alias) existingNewsAliases.add(news.alias);
            });
            console.log(`📊 Найдено существующих новостей: ${existingNewsAliases.size}`);
        } catch (error) {
            console.log('⚠️ Не удалось проверить существующие новости:');
            logErrorDetails(error, 'checkExistingNews');
        }

        for (const [index, item] of jsonData.items.entries()) {
            console.log(`\n--- Обработка [${index + 1}/${jsonData.items.length}]: ${item.title} ---`);

            // Проверяем, существует ли новость с таким alias
            if (existingNewsAliases.has(item.alias)) {
                console.log(`⏭️ Пропущена (дубликат): ${item.title}`);
                skipCount++;
                continue;
            }

            const categoryId = categoryMap.get(item.catid);
            const authorId = authorMap.get(item.author?.name);

            if (!categoryId) {
                console.log(`⚠️ Пропущена: категория ${item.catid} не найдена`);
                errorCount++;
                failedItems.push({
                    title: item.title,
                    alias: item.alias,
                    error: `Категория ${item.catid} не найдена`,
                    data: { catid: item.catid, categoryMap: Array.from(categoryMap.entries()) }
                });
                continue;
            }

            if (!authorId) {
                console.log(`⚠️ Пропущена: автор "${item.author?.name}" не найден`);
                errorCount++;
                failedItems.push({
                    title: item.title,
                    alias: item.alias,
                    error: `Автор "${item.author?.name}" не найден`,
                    data: { author: item.author, authorMap: Array.from(authorMap.entries()) }
                });
                continue;
            }

            try {
                // Загружаем основное изображение
                let mainImageId = null;
                if (item.imageLarge) {
                    const mainImageUrl = `https://www.orgma.ru${item.imageLarge}`;
                    console.log(`📸 Основное изображение: ${mainImageUrl}`);
                    mainImageId = await uploadImageToStrapi(mainImageUrl);
                } else {
                    console.log('ℹ️  Основное изображение отсутствует');
                }

                // Извлекаем ссылки на изображения галереи
                const galleryUrls = extractGalleryUrls(item.gallery);

                // Загружаем изображения галереи в Strapi
                let galleryImageIds = [];
                if (galleryUrls.length > 0) {
                    galleryImageIds = await uploadGalleryImages(galleryUrls);
                }

                // Валидация данных перед созданием
                const validation = validateNewsData(item, categoryId, authorId, mainImageId, galleryImageIds);
                if (!validation.isValid) {
                    console.log(`❌ Ошибка валидации: ${validation.errors.join(', ')}`);
                    errorCount++;
                    failedItems.push({
                        title: item.title,
                        alias: item.alias,
                        error: `Ошибка валидации: ${validation.errors.join(', ')}`,
                        data: { validationErrors: validation.errors }
                    });
                    continue;
                }

                const newsData = {
                    data: {
                        title: item.title,
                        alias: item.alias,
                        introtext: item.introtext || '',
                        fulltext: item.fulltext || '',
                        created: item.created,
                        image: item.imageLarge ? `https://www.orgma.ru${item.imageLarge}` : null,
                        category: categoryId,
                        author: authorId,
                        gallery: galleryImageIds
                    }
                };

                // Добавляем основное изображение если оно загружено
                if (mainImageId) {
                    newsData.data.image = mainImageId;
                }

                console.log(`📤 Отправка данных в Strapi...`);
                await axios.post(
                    `${STRAPI_URL}/api/news-items`,
                    newsData,
                    {
                        headers: {
                            'Authorization': `Bearer ${API_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const imageInfo = [];
                if (mainImageId) imageInfo.push('основное изображение');
                if (galleryImageIds.length > 0) imageInfo.push(`галерея: ${galleryImageIds.length} изображений`);

                console.log(`✅ Успешно создана: ${item.title} (${imageInfo.join(', ') || 'без изображений'})`);
                successCount++;

                // Добавляем в множество существующих
                existingNewsAliases.add(item.alias);
            } catch (error) {
                console.log(`❌ Ошибка создания новости "${item.title}":`);
                logErrorDetails(error, 'createNewsItem');
                errorCount++;

                failedItems.push({
                    title: item.title,
                    alias: item.alias,
                    error: error.response?.data?.error?.message || error.message,
                    data: {
                        status: error.response?.status,
                        responseData: error.response?.data
                    }
                });
            }

            // Увеличиваем задержку из-за загрузки изображений
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n🎉 Импорт завершен!');
        console.log(`📊 Результаты:`);
        console.log(`   ✅ Успешно создано: ${successCount}`);
        console.log(`   ⏭️ Пропущено дубликатов: ${skipCount}`);
        console.log(`   ❌ Ошибки: ${errorCount}`);
        console.log(`   📝 Всего обработано: ${jsonData.items.length}`);

        // Сводка по авторам и категориям
        console.log(`\n📋 Сводка:`);
        console.log(`   📁 Категорий: ${categoryMap.size}`);
        console.log(`   👥 Авторов: ${authorMap.size}`);

        // Детальный отчет об ошибках
        if (failedItems.length > 0) {
            console.log(`\n🔍 Детальный отчет об ошибках (${failedItems.length}):`);
            failedItems.forEach((failedItem, index) => {
                console.log(`\n   ${index + 1}. "${failedItem.title}"`);
                console.log(`      Alias: ${failedItem.alias}`);
                console.log(`      Ошибка: ${failedItem.error}`);
                if (failedItem.data) {
                    console.log(`      Данные: ${JSON.stringify(failedItem.data, null, 2)}`);
                }
            });

            // Сохраняем отчет в файл
            const report = {
                timestamp: new Date().toISOString(),
                results: {
                    success: successCount,
                    skipped: skipCount,
                    errors: errorCount,
                    total: jsonData.items.length
                },
                failedItems: failedItems
            };

            fs.writeFileSync('./import-error-report.json', JSON.stringify(report, null, 2));
            console.log(`\n📄 Полный отчет сохранен в import-error-report.json`);
        }
    } catch (error) {
        console.error('💥 Критическая ошибка:');
        logErrorDetails(error, 'importNews');
    }
}

// Запуск импорта
importNews();