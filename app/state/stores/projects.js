var Nuclear = require('nuclear-js');
var Immutable = Nuclear.Immutable
import { projectPropsToIds } from '../helpers'
import getters from '../getters'
import reactor from '../reactor'
import { uploadProjectPreview, newId} from '../utils'
import { projectsRef, imageIndexRef } from '../firebaseRefs'

function l() {
	console.log.apply(console, Array.prototype.slice.call(arguments))
}

function persistNewProject(project) {
	var firebaseProject = projectPropsToIds(project)
	projectsRef.child(project.get('id')).set(firebaseProject.toJS())
}

var persistWithRef = (firebaseRef, id, obj) => {
	// if (DEBUG) {
		console.log(`Saving to firebase ref ${firebaseRef} at id: ${id}.`)
	// }
	firebaseRef.child(id).update(obj)
}

var persistProject = persistWithRef.bind(null, projectsRef)
var persistImageIndex = persistWithRef.bind(null, imageIndexRef)

export default new Nuclear.Store({

	getInitialState() {
		return Nuclear.toImmutable({});
	},

	initialize() {
	 this.on('addProject', (state, project) => {
		 project.tags = project.tags ? Object.keys(project.tags) : []
		 return state.set(project.id, Immutable.fromJS(project))
	 })

	 this.on('addManyProjects', (state, projects) => {
		 return projects.reduce((retVal, project) => {
			 project.tags = project.tags ? Object.keys(project.tags) : []
			 return retVal.set(project.id, Immutable.fromJS(project))
		 }, state)
	 })

	 this.on('deleteProject', (state, project) => {
		 var projectId = project.get('id')
		 if (state.has(projectId)) {
			 projectsRef.child(projectId).remove()
			 return state.remove(projectId)
		 }
		 return state
	 })

	 this.on('loadAdminCreatedProjects', (state, project) => {
		 if (state.count() > 2) { return state }

		 var projectsQuery = projectsRef.orderByChild('adminCreated').equalTo(true)
		 projectsQuery.on('value', snapshot => {
			 var data = snapshot.val()
			 var projects = Object.keys(data).map(id => {
				 var obj = data[id]
				 obj.id = id
				 return obj
			 })
			var interval = setInterval(() => {
				if (!reactor.__isDispatching) {
					clearInterval(interval)
					reactor.dispatch('addManyProjects', projects)
				}
			}, 100)
		 })
		 return state
	 })

	 this.on('selectImage', (state, image) => {
		 var currentProject = reactor.evaluate(getters.currentProject)
		 var currentImageIndexId = reactor.evaluate(['currentImageIndexId'])
		 var imageIndex = currentProject.get('imageIndex')
		 var i = imageIndex.findIndex(l => l.get('id') === currentImageIndexId)
		 var newImageIndex = images.update(i, v => v.set('selectedImage', image))
		 var newProject = currentProject.set('imageIndex', newImageIndex)
		 persistImageIndex(currentImageIndexId, {'selectedImage': image.get('id')})
		 return state.set(newProjects.get('id'), newProjects)
	 })

		this.on('saveProject', (state, project) => {
			project.get('imageIndex').forEach(imageIndex => {
				var i = imageIndex.toJS()
				i.selectedImage = i.selectedImage.id
				imageIndexRef.child(i.id).set(i)
			})
			persistNewProject(project)
			return state.set(project.get('id'), project)
		})

	 this.on('createNewProject', (state, newProjectData) => {
		var newProject = newProjectData.project
		var name = newProject.get('name')
		uploadProjectPreview (name, (err, imgUrls) => {
			if (err) {
				console.log('got error: ', err)
				return
			}
			var now = new Date().getTime()
			var project = newProject.toJS()
			var imageIndexIds = project.imageIndex.map((imageIndex, i) => {
				imageIndex.selectedImage = imageIndex.selectedImage.id
				imageIndex.createAt = now
				imageIndex.updatedAt = now
				imageIndex.images = reactor.evaluate(getters.imageIds).toJS()
				var newImageIndexRef = imageIndexRef.push(imageIndex)
				return newImageIndexRef.key()
			})
			project.smallImageUrl = imgUrls.small
			project.largeImageUrl = imgUrls.large
			project.imageIndex = imageIndexIds
			project.createdAt = now
			project.updatedAt = now
			var newProjectRef = projectsRef.push(project)
			project.id = newProjectRef.key()
			reactor.dispatch('addProject', project)
		 }.bind(this))
		return state
	 })

	 this.on('updateProject', (state, projectData) => {
		var updatedProject = projectData.project
		var name = updatedProject.get('name')
		uploadProjectPreview(name, (err, imgUrls) => {
			if (err) {
				console.log('got error: ', err)
				return
			}
			var now = new Date().getTime()
			var project = updatedProject.toJS()
			console.log('--PROJECT--')
			console.log(project);
			var imageIndexIds = project.imageIndex.map((imageIndex, i) => {
				var id = imageIndex.id

				console.log('--IMAGE.ID--')
				console.log(imageIndex)

				delete imageIndex.id
				imageIndex.selectedImage = imageIndex.selectedImage.id
				imageIndex.updatedAt = now
				persistImageIndex(id, imageIndex)
				return id
			})
			var id = project.id

			console.log('--PROJECT IMAGE.ID--')
			console.log(id);

			delete project.id
			project.smallProjectUrl = imgUrls.small
			project.largeProjectUrl = imgUrls.large
			project.imageIndex = imageIndexIds
			project.updatedAt = now
			persistProject(id, project)
			project.id = id
			reactor.dispatch('addProject', project)
		})
		return state
	 })
	}
})