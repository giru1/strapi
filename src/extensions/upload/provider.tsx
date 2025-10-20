// const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
//
// module.exports = {
//     init(config) {
//         const s3Client = new S3Client({
//             region: config.region || 'us-east-1',
//             endpoint: config.endpoint || 'http://localhost:9000',
//             credentials: {
//                 accessKeyId: config.accessKeyId,
//                 secretAccessKey: config.secretAccessKey,
//             },
//             forcePathStyle: config.forcePathStyle !== false,
//         });
//
//         return {
//             async upload(file) {
//                 try {
//                     const path = file.path ? `${file.path}/` : '';
//                     const key = `${path}${file.hash}${file.ext}`;
//
//                     const command = new PutObjectCommand({
//                         Bucket: config.bucket,
//                         Key: key,
//                         Body: file.stream || Buffer.from(file.buffer, 'binary'),
//                         ContentType: file.mime,
//                         ACL: 'public-read', // ✅ Важно для публичного доступа
//                     });
//
//                     await s3Client.send(command);
//
//                     // ✅ Формируем правильный URL
//                     const endpoint = config.endpoint || 'http://localhost:9000';
//                     file.url = `${endpoint}/${config.bucket}/${key}`;
//
//                 } catch (error) {
//                     throw new Error(`Upload failed: ${error.message}`);
//                 }
//             },
//
//             async delete(file) {
//                 try {
//                     const path = file.path ? `${file.path}/` : '';
//                     const key = `${path}${file.hash}${file.ext}`;
//
//                     const command = new DeleteObjectCommand({
//                         Bucket: config.bucket,
//                         Key: key,
//                     });
//
//                     await s3Client.send(command);
//
//                 } catch (error) {
//                     throw new Error(`Delete failed: ${error.message}`);
//                 }
//             },
//         };
//     },
// };