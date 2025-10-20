// config/plugins.js
module.exports = ({ env }) => ({
    upload: {
        config: {
            provider: 'aws-s3',
            providerOptions: {
                s3Options: {
                    credentials: {
                        accessKeyId: env('S3_ACCESS_KEY_ID'),
                        secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
                    },
                    region: env('S3_REGION'),
                    endpoint: env('S3_ENDPOINT'),
                    forcePathStyle: true, // для совместимости с некоторыми S3-совместимыми хранилищами
                    params: {
                        Bucket: env('S3_BUCKET'),
                    },
                },
            },
            actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
            },
        },
    }
});