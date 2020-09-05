# Image Repository
The goal of this project is to provide a way for users to upload images in a scaled fashion to an _image repository_ hosted in the cloud, in this case it is hosted in an **S3** Bucket on AWS. The project only focuses on the _ADD_ functionality.

## Assumptions
- User should be able to upload a single image, multiple images, or upload in bulk via a zipped file
- The file being uploaded can be very large (>5GB) or small
- The server should be able to filter out the correct file types, meaning it should only upload images (jpg, jpeg, png, gif)
- User can upload a zipped file with any folder structure, the server will extract all the images and store them
- Each user will have their own respective buckets

## Use Cases and Constraints
**We'll scope the problem to handle only the following use cases**
- **Server** receives a POST request of any file type
  - **Server** checks file type
    - If type contains (jpg, jpeg, png, gif), do multipart upload if image is large
    - If type is _zip_, unpack and stream the contents 
      - **Server** filter out image types and does multipart upload if necessary
