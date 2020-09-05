# Image Repository
The goal of this project is to provide a way for users to upload images in a scaled fashion to an _image repository_ hosted in the cloud, in this case it is hosted in an **S3** Bucket on AWS. The project only focuses on the _ADD_ functionality.

## Assumptions
- User should be able to upload a single image, multiple images, or upload in bulk via a zipped file
- The file being uploaded can be very large (>5GB) or small
