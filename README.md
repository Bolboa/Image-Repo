# Image Repository
The goal of this project is to provide a way for users to upload images in a scaled fashion to an _image repository_ hosted in the cloud, in this case it is hosted in an **S3** Bucket on AWS. The project only focuses on the _ADD_ functionality.

## Requirements
- User should be able to upload a single image, multiple images, or upload in bulk via a zipped file
- The file being uploaded can be very large (>5GB) or small
- The server should be able to filter out the correct file types, meaning it should only upload images (jpg, jpeg, png, gif)
- User can upload a zipped file with any folder structure, the server will extract all the images and store them
- Each user will have their own respective buckets

## Use Case
**We'll scope the problem to handle only the following use case**
- **Server** receives a POST request of any file type
  - **Server** checks file type
    - If type contains (jpg, jpeg, png, gif), do multipart upload if image is large
    - If type is _zip_, unpack and stream the contents 
      - **Server** filter out image types and does multipart upload if necessary
    - If images exist, a folder is created for respective user and images are added there
    
## Constraints
According to AWS documentation for **S3**:
>Individual Amazon S3 objects can range in size from a minimum of 0 bytes to a maximum of 5 terabytes. The largest object that can be uploaded in a single PUT is 5 gigabytes.

Since the largest object that can be uploaded in one go is **5 GB**, we need a method to overcome this. After researching further, according to documentation a viable method is to use the _multipart API_:
> <b>Upload objects in parts—</b>Using the multipart upload API, you can upload
> large objects, up to 5 TB.
>
> The multipart upload API is designed to
> improve the upload experience for larger objects. You can upload
> objects in parts. These object parts can be uploaded independently, in
> any order, and in parallel. You can use a multipart upload for objects
> from 5 MB to 5 TB in size.

It is extremely unlikely for an image to be **5 TB**, however a zip file has virtually no size constraint, so theoretically it is possible for us to receive a zip file ranging in the terabytes. Inside a zip file, the images can be of any size so for each image within the zip, it may still be necessary to do a _multipart_ upload for each image.

Since the size constraint for a file is **5 TB** in **S3**, even with _multipart_ upload, it may not be a good idea to try to upload the zip itself in parts in the off chance that it is greater than **5 TB**. For this reason it is better to stream the contents from a server such as _EC2_ that can handle processing large files.

## Choice Of Design
**Multipart**

Given the constraints listed above, it is necessary to upload the file in parts using the _multipart API_. The server will receive a file and it will convert it into a data buffer. A buffer here is an array of bytes, printed in hexadeciamal 00 to ff, or 0 to 255. 

```<Buffer ff d8 ff e2 0b f8 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 0b e8 00 00 00 00 02 00 00 00 6d 6e... >```

The neat thing about buffers is that they are easy to _slice_. We will be uploading the slices one by one and keeping track of when the file is finished uploading. To scale even further, we can also make asynchronous calls to upload each part, taking advantage of multithreading.

<p align="center">
  <img src="/images/s3_multipart_upload.png" />
</p>

**Uploading Zip Files**

The second aspect of the project was to figure out a reliable way to upload all the contents of a zip file into the **S3** Image Repository. My first attempt was to upload the zip file using multipart upload to one **S3**, and then have a **lambda** get kicked off that will stream and filter the images to another **S3** (Image Repository). This approach I realized was not ideal because AWS **lambda** have a hard limit for temporary storage of **512 MB**. 

>Deployment package size:
>(50 MB (zipped, for direct upload), 250 MB (unzipped, including layers), 3 MB (console editor))

>/tmp directory storage:
>512 MB

If I were to upload a very large zip file, it is very possible for the **lambda** to potentially timeout. Since I want to ensure the application can be scaled, this would not be a great approach.

Instead I decided the better approach would be to have a long running server handle the streaming. That way the constraint is passed on to the server which can be scaled up if necessary. The server unpacks and stream the zip file using a streaming API for _node.js_. The stream converts the contents of each file into a buffer which makes it easy to pass into the multipart upload functionality. Moreover, the neat thing about the stream API I chose is that it seems that it does not need to first store all of the zip contents in memory first, so it is potentially less resource-heavy.

##Testing
Unit tests were written to test the file uploading in `/routes/test` using `Jest`.

Tests cover:
- Correct status code returned (png => 200, zip => 200, pdf => 400, etc.)
- Check proper files were uploaded to **S3** (non-zip)
  - Contains only images
  - Test folder contains 1 of each image
- Check proper files were uploaded to **S3** (zip)
  - Test folder contains all file content from zip
- Check if multiple user folder are created for different user requests
