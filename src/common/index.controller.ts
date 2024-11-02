import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { apiPrefix } from 'src/config';

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
} = process.env;

const generateS3Client = async () => {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
};

@Controller(apiPrefix)
export class CommonController {
  @Get('common/upload-presigned-url')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req) {
    const { nanoid } = await import('nanoid');

    const S3 = await generateS3Client();
    const key = nanoid();

    try {
      const url = await getSignedUrl(
        S3,
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
        }),
        {
          expiresIn: 600,
        },
      );
      return { url, key };
    } catch (error: any) {
      return { error: error.message };
    }
  }
}
