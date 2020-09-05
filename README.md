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
    
## Constraint
According to AWS documentation for **S3**:
>Individual Amazon S3 objects can range in size from a minimum of 0 bytes to a maximum of 5 terabytes. The largest object that can be uploaded in a single PUT is 5 gigabytes.

> <b>Upload objects in parts—</b>Using the multipart upload API, you can upload
> large objects, up to 5 TB.
>
> The multipart upload API is designed to
> improve the upload experience for larger objects. You can upload
> objects in parts. These object parts can be uploaded independently, in
> any order, and in parallel. You can use a multipart upload for objects
> from 5 MB to 5 TB in size.
