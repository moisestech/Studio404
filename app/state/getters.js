var Set = require('nuclear-js').Immutable.Set
var Map = require('nuclear-js').Immutable.Map
var getters = {}

getters.projects = [['projects'], projectsMap => projectsMap.toList()]
getters.adminCreatedProjects = [
  getters.projects,
  projects => projects.filter(d => d.get('adminCreated'))
]

getters.currentProject = [
  ['currentProjectId'],
  ['projects'],
  (currentProjectId, projectsMap) => projectsMap.get(currentProjectId)
]

getters.currentImageIndex = [
  ['currentImageIndexId'],
  getters.currentProject,
  (imageIndexId, project) => project ? projects.get('imageIndex').find(v => v.get('id') === imageIndexId) : null
]

getters.currentImage = [
  getters.currentImageIndex,
  (currentImageIndex) => {
    return currentImageIndex ? currentImageIndex.get('selectedImage') : null
  }
]

getters.images = [
  ['images'], images => {
    return (
      images
        .toList()
        .filter(image => image)
        .sort((imageOne, imageTwo) => imageTwo.get('createdAt') - imageOne.get('createdAt'))
    )
  }
]

getters.imageIds = [
  getters.images, images => images.map(li => li.get('id'))
]

getters.tags = [
  ['tags'], tags => tags ? tags.toList() : []
]

export default getters
