import { imageIndexRef, imagesRef, tagsRef} from './firebaseRefs'
import reactor from './reactor'
var Map = require('nuclear-js').Immutable.Map
var RSVP = require('RSVP')

var exports = {}

exports.dispatchHelper = function() {
  var args = arguments
  var interval = setInterval(() => {
    if (!reactor.__isDispatching) {
      clearInterval(interval)
      reactor.dispatch.apply(reactor, args)
    }
  }, 100)
}

exports.projectPropsToIds = (project) => {
  var imageIds = project.get('images').map(l => l.get('id'))
  return project.set('images', imageIds)
}

function nestedHydrateImageIndex(imageIndexId) {
  return hydrateImageIndex(imageIndexId).then(imageIndex => {
    return hydrateImage(imageIndex.selectedImage).then(image => {
      image.id = imageIndex.selectedImage
      reactor.dispatch('addImage', image)
      imageIndex.selectedImage = image
      imageIndex.id = imageIndexId
      return imageIndex
    })
  })
}

exports.hydrateProject = (project) => {
  var imageIndex = project.imageIndex.map(nestedHydrateImageIndex)
  return RSVP.all(imageIndex).then(imageIndex => {
    project.imageIndex = imageIndex;
    reactor.dispatch('addProject', project)
  }).catch(e => console.error("Got Error: ", e))
}

var hydrateObj = (ref, id) => {
  return new RSVP.Promise(resolve => {
    ref.child(id).once('value', o => resolve(o.val()))
  })
}

var hydrateAndDispatchData = (dbRef, dispatchMsg, currentState) => {
  dbRef.once('value', snapshot => {
    var data = snapshot.val()
    var dataToDispatch = Object.keys(data).map(id => {
      var obj = data[id]
      obj.id = id
      return obj
    })
    reactor.dispatch(dispatchMsg, dataToDispatch)
  })
}

exports.hydrateAndDispatchImages = hydrateAndDispatchData.bind(null, imagesRef, 'addManyImages')
exports.hydrateAndDispatchTags = hydrateAndDispatchData.bind(null, tagsRef, 'addManyTags')

var hydrateImageIndex = hydrateObj.bind(null, imageIndexRef)
var hydrateImage = hydrateObj.bind(null, imagesRef)

exports.hydrateObj = hydrateObj
export default exports
