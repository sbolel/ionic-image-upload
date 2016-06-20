(function(AWS){
  'use strict';
  const sizeLimit = 10485760;   // 10MB in Bytes
  const sizeLabel = Math.round(sizeLimit / 1024 / 1024) + 'MB';   // Bytes To MB string

  // Generate a unique string
  const uniqueString = function() {
    var text = '';
    const regx = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var idx = 0; idx < 8; idx++) {
      text = text + regx.charAt(Math.floor(Math.random() * regx.length));
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
    sizeLimit: sizeLimit,
    uploadProgress: 0,
  };

  // ImageUploader class
  function ImageUploader(inputConfig) {
    const config = Object.assign({}, defaultConfig, inputConfig);
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

  ImageUploader.prototype = {
    validateFile: function(file) {
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
    clearProgress: function() {
      this._uploadProgress = 0;
    },
    updateProgress: function(progress) {
      this._uploadProgress = progress;
    },
    resetUploadProgress: function() {
      setTimeout(function() {
        ImageUploader.prototype.clearProgress();
      }, 100);
    },
    push: function(file) {
      const self = this;
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
      return new Promise(function(resolve, reject) {
        self._bucket.putObject(params, function(err, data) {
          if (err) {
            self._err = Object.assign({}, err, { data: data });
            reject(err);
          }
          self.resetUploadProgress();
          Object.assign(data, data, { filename: filename, url: self._bucketUrl + filename });
          resolve(data);
        }).on('httpUploadProgress', function(prog) {
          self.updateProgress(Math.round(prog.loaded / prog.total * 100));
        });
      });
    },
  };

  window.ImageUploader = ImageUploader;
})(AWS);
