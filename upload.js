require('dotenv').config();
const fs = require("fs");
const AWS = require('aws-sdk');
AWS.config.update({accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET});

const PART_SIZE = 1024 * 1024 * 5;
const MAX_UPLOAD_RETRIES = 3;
const BUCKET = process.env.BUCKET_NAME;

var multiPartParams = {
  Bucket: BUCKET,
  Key: "test",
  ContentType: 'image/jpeg'
};

var multipartMap = {
  Parts: []
};

const uploadFile = async (ctx) => {
  const s3 = new AWS.S3();
  var buffer = fs.readFileSync(ctx.request.files.test.path);
  let partNum = 0;
  s3.createMultipartUpload(multiPartParams, (err, multipart) => {
    if (err) console.log(err, err.stack);
    else console.log(multipart);
    
    for (let rangeStart = 0; rangeStart < buffer.size; rangeStart += PART_SIZE) {
      partNum++;
      const partParams = {
        Body: buffer.slice(rangeStart, Math.min(rangeStart + PART_SIZE, buffer.length)),
        Bucket: BUCKET,
        Key: "test",
        PartNumber: String(partNum),
        UploadId: multipart.UploadId
      };
      uploadSlice(s3, multipart, partParams);
    }
  });
}

const uploadSlice = (s3, multiPart, partParams, retries=1) => {
  s3.uploadPart(partParams, (err, data) => {
    if (err) {
      if (retries < MAX_UPLOAD_RETRIES) {
        uploadSlice(s3, multipart, partParams, retries+1);
      }
      else {
        console.log('Failed uploading part: #', partParams.PartNumber)
      }
      return;
    }
    const partNum = partParams.PartNumber;
    multipartMap.Parts[partNum - 1] = {
      ETag: data.ETag,
      PartNumber: Number(partNum)
    }
    console.log(multipartMap);

  });
}

module.exports = {
  uploadFile: uploadFile
};