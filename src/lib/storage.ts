import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export function s3() {
  return new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY ?? "", secretAccessKey: process.env.S3_SECRET_KEY ?? "" },
    forcePathStyle: !!process.env.S3_ENDPOINT,
  });
}

export async function uploadBuffer(key: string, body: Buffer, contentType: string) {
  const client = s3();
  await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: body, ContentType: contentType }));
  return `${process.env.S3_ENDPOINT ?? `https://${process.env.S3_BUCKET}.s3.amazonaws.com`}/${key}`;
}
