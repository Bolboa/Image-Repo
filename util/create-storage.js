require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({ accessKeyId: process.env.ID, secretAccessKey: process.env.SECRET });

const s3 = new AWS.S3();

const params = { Bucket: process.env.BUCKET_NAME };

s3.createBucket(params, (err, data) => {
  if (err) console.log(err, err.stack);
  else console.log('Bucket Created Successfully', data.Location);
});