var Nuclear = require('nuclear-js');
var Immutable = Nuclear.Immutable
import reactor from '../reactor'
import { uploadImgToS3 } from '../utils'
import { imagesRef } from '../firebaseRefs'
import { hydrateAndDispatchImages } from '../helpers'

export default new Nuclear.Store({
  getInitialState() { return Nuclear.toImmutable({}) },

  newImageObj(filename, baseImageUrl) {
    var now = new Date().getTime()
    var retVal = {
      filename: filename,
      imageUrl: baseImageUrl,
      createdAt: now,
      updatedAt: now}
    return retVal
  },

  initialize() {
    this.on('addImage', (state, image) => {
      return state.set(image.id, Immutable.fromJS(image));
    })

    this.on('addManyImages', (state, images) => {
      return images.reduce((retVal, image) => {
        return retVal.set(image.id, Immutable.fromJS(image))
      }, state)
    })
    
    this.on('loadAdminCreateProjectData', state => {
      console.log('--LOAD-ADMIN-CREATE-PROJECT-DATA--')
      hydrateAndDispatchImages(state)
      return state
    })
    
    this.on('loadAdminImages', state => {
      console.log('LOAD-ADMIN-IMAGES')
      hydrateAndDispatchImages(state)
      return state
    })

    this.on('loadCurrentProjectEditResources', state => {
      hydrateAndDispatchImages(state)
      return state
    })

    this.on('uploadImageToS3', (state, fileData) => {
      var file = fileData.file
      uploadImgToS3(file, file.name,  'image/png', (err, imageUrl) => {
        if (err) {
          console.log('got err: ', err)
        } else {
          var newImage = this.newImageObj(file.name, imageUrl)
          var newImageRef = imagesRef.push(newImage)
          var imageId = newImageRef.key()
          newImage.id = imageId
          var imageImm = Immutable.fromJS(newImage)
          reactor.dispatch('addImage', imageImm)
          reactor.dispatch('imageUploadedSuccessfully', imageImm)
        }
      }.bind(this))
      return state
    })

    this.on('deleteImage', (state, image) => {
      var imageId = image.get('id')
      var projectsToDelete = reactor.evaluate(['projects']).filter(d => {
        return d.get('projects').some(project => project.getIn(['selectedImage', 'id']) === imageId)
      })
      projectsToDelete.forEach(d => reactor.dispatch('deleteProject', d))
      imagesRef.child(imageId).remove()
      return state.delete(image.get('id'))
    })
  }
})
