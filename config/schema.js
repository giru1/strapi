module.exports = {
    kind: 'collectionType',
    collectionName: 'news_items',
    info: {
        singularName: 'news-item',
        pluralName: 'news-items',
        displayName: 'News Item',
        description: 'Новости и события',
    },
    options: {
        draftAndPublish: true,
    },
    pluginOptions: {
        'content-manager': {
            visible: true,
        },
        'content-type-builder': {
            visible: true,
        },
    },
    attributes: {
        title: {
            type: 'string',
            required: true,
        },
        alias: {
            type: 'string',
            unique: true,
        },
        introtext: {
            type: 'text',
        },
        fulltext: {
            type: 'richtext',
        },
        created: {
            type: 'datetime',
        },
        image: {
            type: 'media',
            multiple: false,
        },
        gallery: {
            type: 'media',
            multiple: true,
        },
        hits: {
            type: 'integer',
            default: 0,
        },
        featured: {
            type: 'boolean',
            default: false,
        },
        category: {
            type: 'relation',
            relation: 'manyToOne',
            target: 'api::category.category',
            inversedBy: 'news_items',
        },
        author: {
            type: 'relation',
            relation: 'manyToOne',
            target: 'api::author.author',
            inversedBy: 'news_items',
        },
        tags: {
            type: 'relation',
            relation: 'manyToMany',
            target: 'api::tag.tag',
            inversedBy: 'news_items',
        },
    },
};