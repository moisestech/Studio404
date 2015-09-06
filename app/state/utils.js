import {credsRef} from './firebaseRefs'
var config = require('../../config')
var pako = require('pako')
var srcDir = config.srcDir
var s3Endpoint = config.s3Endpoint
var s3BucketName = config.s3BucketName
var projectPreviewSize = config.projectPreviewSize
var projectDetailSize = config.projectDetailSize
var hostname = config.hostname
var window;
var scheme = window ? window.location.protocol : ''
hostname = scheme + '//' + hostname

/**
 * From: https://gist.github.com/mikelehen/3596a30bd69384624c11
 * Fancy ID generator that creates 20-character string identifiers with the following properties:
 *
 * 1. They're based on timestamp so that they sort *after* any existing ids.
 * 2. They contain 72-bits of random data after the timestamp so that IDs won't
 *    collide with other clients' IDs.
 * 3. They sort *lexicographically* (so the timestamp is converted to characters that will sort properly).
 * 4. They're monotonically increasing.  Even if you generate more than one in the same timestamp, the
 *    latter ones will sort after the former ones.  We do this by using the previous random bits
 *    but "incrementing" them by 1 (only in the case of a timestamp collision).
 */
var generateFirebaseID = (function() {
  // Modeled after base64 web-safe chars, but ordered by ASCII.
  var PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

  // Timestamp of last push, used to prevent local collisions if you push twice in one ms.
  var lastPushTime = 0;

  // We generate 72-bits of randomness which get turned into 12 characters and appended to the
  // timestamp to prevent collisions with other clients.  We store the last characters we
  // generated because in the event of a collision, we'll use those same characters except
  // "incremented" by one.
  var lastRandChars = [];

  return function() {
    var now = new Date().getTime();
    var duplicateTime = (now === lastPushTime);
    lastPushTime = now;

    var timeStampChars = new Array(8);
    for (var i = 7; i >= 0; i--) {
      timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
      // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
      now = Math.floor(now / 64);
    }
    if (now !== 0) throw new Error('We should have converted the entire timestamp.');

    var id = timeStampChars.join('');

    if (!duplicateTime) {
      for (i = 0; i < 12; i++) {
        lastRandChars[i] = Math.floor(Math.random() * 64);
      }
    } else {
      // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
      for (i = 11; i >= 0 && lastRandChars[i] === 63; i--) {
        lastRandChars[i] = 0;
      }
      lastRandChars[i]++;
    }
    for (i = 0; i < 12; i++) {
      id += PUSH_CHARS.charAt(lastRandChars[i]);
    }
    if(id.length != 20) throw new Error('Length should be 20.');

    return id;
  };
}())

var toA = (list) => Array.prototype.slice.call(list, 0)

var dataUriToBlob = (dataUri) => {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString = (
    (dataUri.split(',')[0].indexOf('base64') >= 0)
    ? atob(dataUri.split(',')[1])
    : unescape(dataUri.split(',')[1])
  )
  // separate out the mime component
  var mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0]
  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length)
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ia], {type:mimeString});
}


var renderProjectToJpegBlob = (size) => {
  var w = size, h = size
  var canvas = document.createElement('canvas')
  canvas.height = h
  canvas.width = w

  var ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, w, h)
  var bgColor = '#fff'

  //Draw a white background.
  ctx.globalCompositeOperation = "destination-over"
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, w, h)
  return dataUriToBlob(canvas.toDataURL('image/jpeg', 1.0))
}

var urlForImage = (name, type) => {
  var retVal = hostname + '/images/' + name
  if (type) { retVal += '.' + type }
  return retVal
}

var s3UrlForImage = (filename) => {
  return `${s3Endpoint}/${s3BucketName}/${filename}`
}

var imageUrlForImage = (image) => {
  console.log('----imageUrlForImage----')
  console.log(image.toJS())
  var filename = (image.has('filename')
    ? image.get('filename')
    : image.get('imageUrl').split('/').pop())
  // console.log(urlForImage(filename))
  return urlForImage(filename)
}

var uploadImgToS3 = (file, filename, imgType, onComplete) => {
  var body = file

  console.log('--IMG-TYPE--')
  console.log(file)
  console.log(imgType)
  console.log(filename)

  if (imgType === 'image/png') {
    // body = pako.gzip(file)
  }
  credsRef.once('value', snapshot => {
    var creds = snapshot.val()
    AWS.config.credentials = {
      accessKeyId: creds.s3AccessKey,
      secretAccessKey: creds.s3SecretKey}
    var params = {
      Bucket: s3BucketName,
      Key: filename,
      ACL: 'public-read',
      CacheControl: 'max-age: 45792000',
      ContentType: imgType,
      Body: body}

    var s3 = new AWS.S3()
    s3.putObject(params, (err, d) => {
      if (err) {
        console.log('got error: ',err)
        onComplete(new Error('Failed to upload to s3.'))
      } else {
        onComplete(null, s3UrlForImage(filename))
      }
    })
  })
}

export default {
  imageUrlForProject(project, size) {
    console.log('----imageUrlForProject----')
    console.log(project.toJS())

    if (size === 'small') {
      return project.get('smallImageUrl')
    }
    if (size === 'large') {
      return project.get('largeImageUrl')
    }
    
    var filename = (project.has('name')
        ? project.get('name')
        : project.get('imageUrl').split('/').pop())
    console.log('----FILENAME----', filename)
    return urlForImage(filename + '-' + size, 'png')
  },

  imageUrlForImageIndex(imageIndex) {
    console.log("--IMAGE.URL.FOR.IMAGE--")
    console.log(imageIndex)
    return imageUrlForImage(imageIndex.get('selectedImage'))
  },

  imageUrlForImage: imageUrlForImage,

  newId: generateFirebaseID,

  s3UrlForImage: s3UrlForImage,

  uploadImgToS3: uploadImgToS3,

  uploadProjectPreview(name, onComplete) {
    var projectJpgBlobSmall = renderProjectToJpegBlob(projectPreviewSize)
    var projectJpgBlobLarge = renderProjectToJpegBlob(projectDetailSize)
    var smallImageFilename = name + '-small' + '.png'
    var largeImageFilename = name + '-large' + '.png'
    uploadImgToS3(projectJpgBlobSmall, smallImageFilename, 'image/png', (err, smallImgUrl) => {
      if (err) {
        console.log('got error: ',err)
        onComplete(new Error('Failed to upload ' + smallImgUrl + ' to s3.'))
        return
      }
      uploadImgToS3(projectJpgBlobLarge, largeImageFilename, 'image/png', (err, largeImgUrl) => {
        if (err) {
          console.log('got error: ',err)
          onComplete(new Error('Failed to upload ' + largeImgUrl + ' to s3.'))
          return
        }
        onComplete(null, {small: smallImgUrl, large: largeImgUrl})
      })
    })
  }
}
