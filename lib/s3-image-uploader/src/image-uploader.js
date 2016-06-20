(function(AWS){

  // Establish a reference to the `window` object, and
  // save the previous value of the `ImageUpload` variable.
  const root = this;
  const previousImageUpload = root.ImageUploader;

  const sizeLimit = 10485760;   // 10MB in Bytes
  const sizeLabel = Math.round(sizeLimit / 1024 / 1024) + 'MB';   // Bytes To MB string

  // Generate a unique string
  const uniqueString = function() {
    let text = '';
    const regx = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let idx = 0; idx < 8; idx++) {
      text = `${text}${regx.charAt(Math.floor(Math.random() * regx.length))}`;
    }
    return text;
  };

  const defaultConfig = {
    accessKeyId: 'AKIAJDDLMBIFFIUWYCEA',
    bucket: {},
    bucketName: 'com.thinkcrazy.ionicimageupload',
    bucketUrl: 'https://s3.amazonaws.com/com.thinkcrazy.ionicimageupload/',
    file: {},
    region: 'us-east-1',
    secretAccessKey: 'gCF19auerZBOx9IvpPpKAlCJYbD0yUo+bLyNB+wA',
    sizeLimit,
    uploadProgress: 0,
  };

  // ImageUploader class
  function ImageUploader(inputConfig) {
    const config = inputConfig || defaultConfig;
    AWS.config.update({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region,
    });
    this._err = {};
    this._accessKeyId = config.accessKeyId;
    this._secretAccessKey = config.secretAccessKey;
    this._region = config.region;
    this._bucketName = config.bucketName;
    this._bucketUrl = config.bucketUrl;
    this._file = config.file;
    this._uploadProgress = config.uploadProgress;
    this._sizeLimit = config.sizeLimit;
    this._bucket = new AWS.S3({ params: { Bucket: this._bucketName } });
    return this;
  }

  root.ImageUploader = ImageUploader;

  ImageUploader.prototype = {
    validateFile(file) {
      // Check that file exists
      if (!file.size) {
        this._err = { message: 'Missing file argument', code: 'No File' };
      }
      // Check that file size is above 0
      if (file.size <= 0) {
        this._err = { message: 'File has size of 0', code: 'Erroneous File' };
      }
      // Check that file size is below size limit
      if (Math.round(parseInt(file.size, 10)) > this._sizeLimit) {
        this._err = { code: 'File Too Large', message: 'Attachment too big. Max ' + sizeLabel + ' allowed' };
      }
      return this._err;
    },
    clearProgress() {
      this._uploadProgress = 0;
    },
    updateProgress(progress) {
      this._uploadProgress = progress;
    },
    resetUploadProgress() {
      setTimeout(function() {
        ImageUploader.prototype.clearProgress();
      }, 100);
    },
    push(file, callback) {
      if (!this.validateFile(file)) {
        throw new Error('Missing file.');
      }
      const filename = encodeURI(uniqueString() + '-' + file.name);
      const params = {
        ACL: 'public-read',
        Body: file,
        Bucket: this._bucketName,
        ContentType: file.type,
        Key: filename,
        ServerSideEncryption: 'AES256',
      };
      this.updateProgress(0);
      this._bucket.putObject(params, function(err, data) {
        if (err) {
          this._err = Object.assign({}, err, { data });
          return false;
        }
        this.resetUploadProgress();
        Object.assign(data, data, { filename, url: this._bucketUrl + filename });
        callback(data);
        return true;
      }).on('httpUploadProgress', function(prog) {
        this.updateProgress(Math.round(prog.loaded / prog.total * 100));
      });
    },
  };
})(window.AWS);
