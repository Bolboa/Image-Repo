require('dotenv').config();
const fs = require("fs");
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

const upload = async ctx => {
  const s3 = new AWS.S3();
  const files = ctx.request.files;
  await Promise.all(Object.keys(files).map(async (key) => {
    await uploadSingleFile(s3, files[key]);
  }));
};

const uploadSingleFile = async (s3, file) => {  
  const contentType = file.type;
  const bucket = await getFileType(contentType);
  if (bucket === undefined) {
    throw new Error(`Cannot Upload the Following Content Type -> ${contentType}`);
  }
  const buffer = fs.readFileSync(file.path);
  const fileName = file.name;
  let sizeLeft = Math.ceil(buffer.length / PART_SIZE);
  await s3.createMultipartUpload({
    Bucket: bucket,
    Key: fileName,
    ContentType: contentType
  }, (err, multipart) => {
    if (err) throw new Error("errr");

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
    if (data === null) throw new Error("eeee");
    const partNum = partParams.PartNumber;
    if (err) {
      if (retries < MAX_UPLOAD_RETRIES)
        uploadSlice(s3, partParams, retries+1);
      else throw new Error(`Failed uploading part: #${partNum}`)
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
      if (err) throw new Error(err.stack);
      else console.log('Upload Successful', data);
    });
  });
}

const getFileType = async (contentType) => {
  if (contentType.match(FILE_REGEX))
    return IMAGE_REPO;
  else if (contentType === 'application/zip')
    return ZIP_BUCKET;
  else return;
}

module.exports.default = upload;