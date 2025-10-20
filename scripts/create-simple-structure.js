const fs = require('fs');
const path = require('path');

// Базовая конфигурация
const config = {
    basePath: './src/api',
    apis: [
        {
            name: 'category',
            displayName: 'Category',
            description: 'Категории новостей',
            attributes: {
                name: { type: 'string', required: true },
                alias: { type: 'string', unique: true },
                description: { type: 'text' },
                ordering: { type: 'integer', default: 0 }
            }
        },
        {
            name: 'author',
            displayName: 'Author',
            description: 'Авторы новостей',
            attributes: {
                name: { type: 'string', required: true },
                avatar: { type: 'media', multiple: false }
            }
        },
        {
            name: 'tag',
            displayName: 'Tag',
            description: 'Теги новостей',
            attributes: {
                name: { type: 'string', required: true, unique: true }
            }
        },
        {
            name: 'news-item',
            displayName: 'News Item',
            description: 'Новости и события',
            attributes: {
                title: { type: 'string', required: true },
                alias: { type: 'string', unique: true },
                introtext: { type: 'text' },
                fulltext: { type: 'richtext' },
                created: { type: 'datetime' },
                hits: { type: 'integer', default: 0 },
                featured: { type: 'boolean', default: false },

                // ПРОСТЫЕ отношения без inversedBy/mappedBy
                category: {
                    type: 'relation',
                    relation: 'manyToOne',
                    target: 'api::category.category'
                },
                author: {
                    type: 'relation',
                    relation: 'manyToOne',
                    target: 'api::author.author'
                },
                tags: {
                    type: 'relation',
                    relation: 'manyToMany',
                    target: 'api::tag.tag'
                },

                // Медиа
                image: { type: 'media', multiple: false },
                gallery: { type: 'media', multiple: true }
            }
        }
    ]
};

function createApiStructure() {
    console.log('🎯 Создание упрощенной структуры Strapi...');

    config.apis.forEach(api => {
        const apiPath = path.join(config.basePath, api.name);
        const contentTypePath = path.join(apiPath, 'content-types', api.name);
        const routesPath = path.join(apiPath, 'routes');

        // Создаем папки
        [contentTypePath, routesPath].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Создаем schema.json
        const schema = {
            kind: 'collectionType',
            collectionName: api.name.replace('-', '_') + 's',
            info: {
                singularName: api.name,
                pluralName: api.name + 's',
                displayName: api.displayName,
                description: api.description
            },
            options: {
                draftAndPublish: api.name === 'news-item' // только для новостей
            },
            attributes: api.attributes
        };

        fs.writeFileSync(
            path.join(contentTypePath, 'schema.json'),
            JSON.stringify(schema, null, 2)
        );

        // Создаем простой route
        const routeContent = `module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/${api.name}s',
      handler: '${api.name}.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/${api.name}s/:id',
      handler: '${api.name}.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};`;

        fs.writeFileSync(
            path.join(routesPath, `${api.name}.js`),
            routeContent
        );

        console.log(`✅ Создан API: ${api.name}`);
    });

    console.log('🎉 Все API созданы успешно!');
}

createApiStructure();