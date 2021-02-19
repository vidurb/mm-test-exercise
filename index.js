import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "dotenv";
import express from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";

config();

const multerUpload = multer();
const app = express();
const port = 9000;

const s3 = new S3Client();

const markText = "vidur";
const markImage = `<svg height="40" width="100"> <text x="5" y="30" font-size="24" fill="#000" opacity="0.75">${markText}</text></svg>`;

async function resize(data, height, width) {
  await sharp(data)
    .resize(width, height, { fit: "cover" })
    .png()
    .composite([{ input: Buffer.from(markImage), gravity: "southwest" }])
    .toBuffer();
}

async function s3upload(data, key) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: data,
    })
  );
}

function generateFilenames(name) {
  const strippedName = path.parse(name).name;
  return [`${strippedName}-100px.png`, `${strippedName}-200px.png`];
}

async function getUrl(key) {
  await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
    { expiresIn: 86400 }
  );
}

app.post("/", multerUpload.single("image"), async (req, res, next) => {
  try {
    const [key100, key200] = generateFilenames(req.file.originalname);
    const [img100, img200] = await Promise.all([
      resize(req.file.buffer, 100, 100),
      resize(req.file.buffer, 200, 200),
    ]);
    await Promise.all([s3upload(img100, key100), s3upload(img200, key200)]);
    const [url100, url200] = await Promise.all([
      getUrl(key100),
      getUrl(key200),
    ]);
    res.json({
      "100px": url100,
      "200px": url200,
    });
  } catch (error) {
    next(error);
  }
});

app.listen(port, () => {
  console.log(
    `mm-test-exercise running on port ${port} using bucket ${process.env.S3_BUCKET}`
  );
});
