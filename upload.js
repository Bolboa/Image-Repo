require('dotenv').config();
const fs = require("fs");
const AWS = require('aws-sdk');
AWS.config.update({accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET});

const PART_SIZE = 1024 * 1024 * 5;
const MAX_UPLOAD_RETRIES = 3;
const BUCKET = process.env.BUCKET_NAME;

var multipartMap = {
  Parts: []
};

const uploadFile = async (ctx) => {
  const s3 = new AWS.S3();
  const buffer = fs.readFileSync(ctx.request.files.test.path);
  const fileName = ctx.request.files.test.name;
  let sizeLeft = Math.ceil(buffer.length / PART_SIZE);

  s3.createMultipartUpload({
    Bucket: BUCKET,
    Key: fileName,
    ContentType: 'application/pdf'
  }, (err, multipart) => {
    if (err) console.log(err, err.stack);

    let partNum = 0;
    for (let rangeStart = 0; rangeStart < buffer.length; rangeStart += PART_SIZE) {
      partNum++;
      const partParams = {
        Body: buffer.slice(rangeStart, Math.min(rangeStart + PART_SIZE, buffer.length)),
        Bucket: BUCKET,
        Key: fileName,
        PartNumber: String(partNum),
        UploadId: multipart.UploadId
      };
      uploadSlice(s3, partParams, --sizeLeft);
    }
  });
}

const uploadSlice = async (s3, partParams, sizeLeft, retries=1) => {
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

    if (sizeLeft <= 0) {
      s3.completeMultipartUpload({
        Bucket: BUCKET,
        Key: partParams.Key,
        MultipartUpload: multipartMap,
        UploadId: partParams.UploadId
      }, (err, data) => {
        if (err) console.log(err, err.stack);
        else console.log('Upload Successful', data);
      });
    }
  });
}

module.exports = {
  uploadFile: uploadFile
};