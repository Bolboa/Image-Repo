require('dotenv').config();
const fs = require("fs");
const Router = require('koa-router');
const AWS = require('aws-sdk');
AWS.config.update({accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET});

const PART_SIZE = 1024 * 1024 * 5;
const MAX_UPLOAD_RETRIES = 3;
const ZIP_BUCKET = process.env.ZIP_BUCKET_NAME;
const IMAGE_REPO = process.env.IMAGE_BUCKET_NAME;
const FILE_REGEX = /\/(jpg|jpeg|png|gif)$/i;

var multipartMap = {
  Parts: []
};

const uploadRouter = new Router().post('/documents/upload', async ctx => {
  const s3 = new AWS.S3();
  const files = ctx.request.files;
  Object.keys(files).forEach((key) => {
    uploadSingleFile (s3, files[key]);
  });
});

const uploadSingleFile = async (s3, file) => {
  const contentType = file.type;
  const bucket = await checkFileType(contentType);
  if (bucket === undefined) {
    console.log("Error Uploading the Following Content Type:", contentType);
    return;
  }
  const buffer = fs.readFileSync(file.path);
  const fileName = file.name;
  let sizeLeft = Math.ceil(buffer.length / PART_SIZE);
  
  s3.createMultipartUpload({
    Bucket: bucket,
    Key: fileName,
    ContentType: contentType
  }, (err, multipart) => {
    if (err) console.log(err, err.stack);

    let partNum = 0;
    for (let rangeStart = 0; rangeStart < buffer.length; rangeStart += PART_SIZE) {
      partNum++;
      uploadSlice({
        Body: buffer.slice(rangeStart, Math.min(rangeStart + PART_SIZE, buffer.length)),
        Bucket: bucket,
        Key: fileName,
        PartNumber: String(partNum),
        UploadId: multipart.UploadId
      }, s3, --sizeLeft);
    }
  });
}

const uploadSlice = async (partParams, s3, sizeLeft, retries=1) => {
  await s3.uploadPart(partParams, (err, data) => {
    const partNum = partParams.PartNumber;
    if (err) {
      if (retries < MAX_UPLOAD_RETRIES)
        uploadSlice(s3, partParams, retries+1);
      else 
        console.log('Failed uploading part: #', partNum)
      return;
    }

    multipartMap.Parts[partNum - 1] = {
      ETag: data.ETag,
      PartNumber: Number(partNum)
    }

    sizeLeft <= 0 && s3.completeMultipartUpload({
      Bucket: partParams.Bucket,
      Key: partParams.Key,
      MultipartUpload: multipartMap,
      UploadId: partParams.UploadId
    }, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log('Upload Successful', data);
    });
  });
}

const checkFileType = async (contentType) => {
  if (contentType.match(FILE_REGEX))
    return IMAGE_REPO;
  else if (contentType === 'application/zip')
    return ZIP_BUCKET;
  else return;
}

module.exports.default = uploadRouter;