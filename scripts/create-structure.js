const fs = require('fs');
const path = require('path');

async function createStrapiStructure() {
    const basePath = './src/api';

    // Создаем структуру папок
    const apis = ['category', 'author', 'tag', 'news-item'];

    apis.forEach(apiName => {
        const apiPath = path.join(basePath, apiName);
        const contentTypesPath = path.join(apiPath, 'content-types', apiName);
        const servicesPath = path.join(apiPath, 'services');
        const controllersPath = path.join(apiPath, 'controllers');

        // Создаем папки
        [contentTypesPath, servicesPath, controllersPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        console.log(`✅ Создана структура для ${apiName}`);
    });

    // Создаем схемы для каждого API
    createCategorySchema();
    createAuthorSchema();
    createTagSchema();
    createNewsItemSchema();

    console.log('🎉 Структура Strapi создана!');
}

function createCategorySchema() {
    const schema = {
        kind: 'collectionType',
        collectionName: 'categories',
        info: {
            singularName: 'category',
            pluralName: 'categories',
            displayName: 'Category',
            description: 'Категории новостей'
        },
        options: {
            draftAndPublish: false
        },
        attributes: {
            name: {
                type: 'string',
                required: true
            },
            alias: {
                type: 'string',
                unique: true
            },
            description: {
                type: 'text'
            },
            image: {
                type: 'media',
                allowedTypes: ['images'],
                multiple: false
            },
            ordering: {
                type: 'integer',
                default: 0
            },
            parent: {
                type: 'relation',
                relation: 'oneToOne',
                target: 'api::category.category'
            },
            // ДОБАВЛЕНО: обратное отношение для news_items
            news_items: {
                type: 'relation',
                relation: 'oneToMany',
                target: 'api::news-item.news-item',
                mappedBy: 'category'
            }
        }
    };

    const dirPath = './src/api/category/content-types/category';
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(
        path.join(dirPath, 'schema.json'),
        JSON.stringify(schema, null, 2)
    );
    console.log('✅ Схема Category создана');
}

function createAuthorSchema() {
    const schema = {
        kind: 'collectionType',
        collectionName: 'authors',
        info: {
            singularName: 'author',
            pluralName: 'authors',
            displayName: 'Author',
            description: 'Авторы новостей'
        },
        options: {
            draftAndPublish: false
        },
        attributes: {
            name: {
                type: 'string',
                required: true
            },
            avatar: {
                type: 'media',
                allowedTypes: ['images'],
                multiple: false
            },
            profile: {
                type: 'json'
            },
            // ДОБАВЛЕНО: обратное отношение для news_items
            news_items: {
                type: 'relation',
                relation: 'oneToMany',
                target: 'api::news-item.news-item',
                mappedBy: 'author'
            }
        }
    };

    const dirPath = './src/api/author/content-types/author';
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(
        path.join(dirPath, 'schema.json'),
        JSON.stringify(schema, null, 2)
    );
    console.log('✅ Схема Author создана');
}

function createTagSchema() {
    const schema = {
        kind: 'collectionType',
        collectionName: 'tags',
        info: {
            singularName: 'tag',
            pluralName: 'tags',
            displayName: 'Tag',
            description: 'Теги новостей'
        },
        options: {
            draftAndPublish: false
        },
        attributes: {
            name: {
                type: 'string',
                required: true,
                unique: true
            },
            // ДОБАВЛЕНО: обратное отношение для news_items
            news_items: {
                type: 'relation',
                relation: 'manyToMany',
                target: 'api::news-item.news-item',
                mappedBy: 'tags'
            }
        }
    };

    const dirPath = './src/api/tag/content-types/tag';
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(
        path.join(dirPath, 'schema.json'),
        JSON.stringify(schema, null, 2)
    );
    console.log('✅ Схема Tag создана');
}

function createNewsItemSchema() {
    const schema = {
        kind: 'collectionType',
        collectionName: 'news_items',
        info: {
            singularName: 'news-item',
            pluralName: 'news-items',
            displayName: 'News Item',
            description: 'Новости и события'
        },
        options: {
            draftAndPublish: true
        },
        attributes: {
            title: {
                type: 'string',
                required: true
            },
            alias: {
                type: 'string',
                unique: true
            },
            introtext: {
                type: 'text'
            },
            fulltext: {
                type: 'richtext'
            },
            created: {
                type: 'datetime'
            },
            hits: {
                type: 'integer',
                default: 0
            },
            featured: {
                type: 'boolean',
                default: false
            },
            category: {
                type: 'relation',
                relation: 'manyToOne',
                target: 'api::category.category',
                inversedBy: 'news_items'
            },
            author: {
                type: 'relation',
                relation: 'manyToOne',
                target: 'api::author.author',
                inversedBy: 'news_items'
            },
            tags: {
                type: 'relation',
                relation: 'manyToMany',
                target: 'api::tag.tag',
                inversedBy: 'news_items'
            },
            image: {
                type: 'media',
                allowedTypes: ['images'],
                multiple: false
            },
            gallery: {
                type: 'media',
                allowedTypes: ['images'],
                multiple: true
            }
        }
    };

    const dirPath = './src/api/news-item/content-types/news-item';
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(
        path.join(dirPath, 'schema.json'),
        JSON.stringify(schema, null, 2)
    );
    console.log('✅ Схема News Item создана');
}

// Запускаем создание структуры
createStrapiStructure().catch(console.error);