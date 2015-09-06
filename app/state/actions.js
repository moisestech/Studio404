import reactor from './reactor'

var dispatchHelper = function() {
  var args = arguments
  var interval = setInterval(() => {
    if (!reactor.__isDispatching) {
      clearInterval(interval)
      reactor.dispatch.apply(reactor, args)
    }
  }, 100)
}

export default {
	selectProjectId(id) { dispatchHelper('selectProjectId', id) },
	selectProjectAndImageId(ids) { dispatchHelper('selectProjectAndImageId', ids) },
	selectImageId(id) { dispatchHelper('selectImageId', id) },
	selectImage(image) { dispatchHelper('selectImage', image) },
	deleteImage(image) { dispatchHelper('deleteImage', image) },
	imageReplacementStarted() { dispatchHelper('imageReplacementStarted') },
	imageReplacementComplete() { dispatchHelper('imageReplacementComplete') },
	uploadImageToS3(file) { dispatchHelper('uploadImageToS3', file) },
	createNewProject(newProject) { dispatchHelper('createNewProject', newProject) },
	saveProject(project) { dispatchHelper('saveProject', project)},
	updateProject(projectData) { dispatchHelper('updateProject', projectData)},
	deleteProject(project) { dispatchHelper('deleteProject', project)},
	loadAdminCreateProjectData() { dispatchHelper('loadAdminCreateProjectData') },
	loadAdminCreatedProjects() { dispatchHelper('loadAdminCreatedProjects') },
	loadAdminImages() { dispatchHelper('loadAdminImages') },
	loadCurrentProjectEditResources() { dispatchHelper('loadCurrentProjectEditResources') },
	createNewUser(userProps) { dispatchHelper('createNewUser', userProps) },
	createNewUserAndSetAsCurrent(userProps) { dispatchHelper('createNewUserAndSetAsCurrent',userProps) },
	setCurrentUser(currentUser) { dispatchHelper('setCurrentUser', currentUser) },
	logoutCurrentUser() { dispatchHelper('logoutCurrentUser') },
	createTag(newTagName) { dispatchHelper('createTag', newTagName) },
	loadAdminTags() { dispatchHelper('loadAdminTags') },
	addProjectsToTag(data) { dispatchHelper('addProjectsToTag', data) },
	addImagesToTag(data) { dispatchHelper('addImagesToTag', data) },
	addManyTags(tags) { dispatchHelper('addManyTags', tags) },
	addManyProjects(projects) { dispatchHelper('addManyProjects', projects) },
	addManyImages(images) { dispatchHelper('addManyImages', images) }
}
