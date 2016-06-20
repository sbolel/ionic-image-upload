# Image Uploader

[![Dependency Status][daviddm-image]][daviddm-url]
[![License][license-image]][license-url]

[daviddm-image]: https://img.shields.io/david/sbolel/image-uploader.svg?style=flat-square
[daviddm-url]: https://david-dm.org/sbolel/image-uploader
[license-image]: https://img.shields.io/npm/l/image-uploader.svg?style=flat-square
[license-url]: https://github.com/sbolel/image-uploader/blob/master/LICENSE

An open source plugin for uploading image files to an S3 bucket.

* Repository: https://github.com/sbolel/image-uploader

## Getting Started

Include image-upload.bundle.min.js in your app:

    <script src="lib/image-upload.min.js"></script>

Or, to use this with the Amazon SDK included:

    <script src="lib/image-upload.bundle.min.js"></script>

#### Upload an image from a controller

const imageUpload = new ImageUpload();
imageUpload.push(file, (data) => {
  console.log('File uploaded Successfully', $scope.file, data);
  $scope.uploadUri = data.url;
});

## Configuring AWS S3

You are welcome to use the public S3 bucket that is preconfigured in `src/image-upload.js`. This public bucket will only accept files with JPG and PNG extensions up to 10MB in size. The files are automatically deleted after 24 hours.

To use your own Amazon S3 bucket, change the information in `src/image-upload.js` and uglify by running `grunt` in Terminal from the project directory.

#### Setting up an AWS S3 Bucket for use with Ionic Image Upload

<small>Below is a summary of [Uploading To S3 With AngularJS](http://www.cheynewallace.com/uploading-to-s3-with-angularjs/) by [Cheyne Wallace](http://www.cheynewallace.com/)</small>

To setup an S3 bucket for use with the Ionic Image Upload plugin, we need to:

* Configure an AWS S3 bucket by creating a "public" IAM account:
    - The IAM user will only have permission to PUT files into a particular AWS Bucket and nothing else.
    - This users API key will be public -- anyone will be able to upload to your bucket if they use this key.
* Configure the bucket to expire all objects within 24 hours.
    - Even if someone uploads a 10 Gigabyte file, it will eventually be deleted.
* Configure CORS to prevent uploading of content from anywhere other than your own domain.
* Create a server to transfer uploaded files from the temporary bucket to a permanent bucket:
    - When a new file is uploaded to this temporary bucket from the app;
    - App will send the details of the file to the server;
    - Server will perform any necessary transformations, encryption, resizing, or processing, and,
    - Server will move the file into a permanent bucket.

#### 1. Create the IAM User

1. Open AWS console to the "Security Credentials" section. 
2. Create a new user and call it something like "app_public". 
3. Make sure you download the key information when it is presented, this is what we’ll be feeding into our app later to upload with.
4. Under the permissions section, click "attach a new policy", then select the policy generator.
5. Select Amazon S3 as the service and only select the `PutObject` action from the drop down list.
6. The ARN is an Amazon Resource Name. This will look like `arn:aws:s3:::your_bucket_name`
7. Click "add statement", then save and apply policy. 

Now your user has write-only access to the bucket.

Your policy is going to look something like this;

    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "Stmt126637111000",
          "Effect": "Allow",
          "Action": [
            "s3:PutObject"
          ],
          "Resource": [
            "arn:aws:s3:::your_bucket_name"
          ]
        }
      ]
    }

#### 2. Configure CORS And Expiry On The Bucket

Go to the AWS S3 console, click your bucket, then click the Properties button. You'll use the "Add CORS Configuration" button to configure your bucket to only allow PUT requests from particular origins.

You can use the following sample config -- edit to reflect your development, production and staging environments.

    <?xml version="1.0" encoding="UTF-8"?>
    <CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
        <CORSRule>
            <AllowedOrigin>http://localhost:3000</AllowedOrigin>
            <AllowedOrigin>https://www.yourdomain.com</AllowedOrigin>
            <AllowedOrigin>http://staging.yourdomain.com</AllowedOrigin>
            <AllowedMethod>PUT</AllowedMethod>
            <MaxAgeSeconds>3000</MaxAgeSeconds>
            <ExposeHeader>x-amz-server-side-encryption</ExposeHeader>
            <ExposeHeader>x-amz-request-id</ExposeHeader>
            <ExposeHeader>x-amz-id-2</ExposeHeader>
            <AllowedHeader>*</AllowedHeader>
        </CORSRule>
    </CORSConfiguration>

Expire the objects in this bucket after some short period to prevent malicious use. Your server side code should handle moving and deleting valid files so you can assume those that are left after 24 hours are not meant to be there.

1. From your S3 console, view a bucket, and then click Properties.
2. Expand the "Lifecycle Rules" section and follow the prompts.
3. Set the action to "`Permanently Delete Only`" and set it for `1` day -- this will delete any objects in the bucket that are older than 1 day permanently.

Now, you're ready to use this bucket in your Ionic Image Upload app!
