const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

// Configuração agnóstica do cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Se mudar para Cloudflare R2 ou MinIO no futuro, é só descomentar:
  // endpoint: process.env.S3_CUSTOM_ENDPOINT 
});

/**
 * Função que lida com a rota de geração de Presigned URL
 * Recebe os objetos nativos do HTTP do Node.js por injeção de dependência
 */
async function handleUploadRoute(req, res, requestUrl, origin, sendJson) {
  try {
    const ext = requestUrl.searchParams.get('ext') || 'jpg';
    const fileName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `memorias/${fileName}`,
      ContentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    const finalImageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/memorias/${fileName}`;

    sendJson(res, 200, { 
      uploadUrl: presignedUrl,
      imageUrl: finalImageUrl
    }, origin);

  } catch (error) {
    console.error("[ERRO S3]", error);
    sendJson(res, 500, { error: 'Erro ao gerar link de upload' }, origin);
  }
}

module.exports = { handleUploadRoute };