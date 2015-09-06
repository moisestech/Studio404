var Nuclear = require('nuclear-js');
var Immutable = Nuclear.Immutable
import reactor from '../reactor'
import { tagsRef, projectsRef } from '../firebaseRefs'
import { hydrateAndDispatchTags } from '../helpers'

var hydrateTags = (state) => {
  hydrateAndDispatchTags(state)
  return state
}

var addTagToProject = (tagId, project) => {
  var updatedTags = Immutable.Set(project.get('tags')).add(tagId).toKeyedSeq()
  return project.set('tags', updatedTags)
}

var removeTagFromProject = (tagId, project) => {
  var projectId = project.get('id')
  var tagIds = Immutable.Set(project.get('tags')).remove(tagId)
  return project.set('tags', tagIds.toKeyedSeq())
}

var removeProjectsFromTag = (tag, projectsToRemove) => {
  projectsToRemove = projectsToRemove.map(d => d.get('id'))
  var currentProjects = Immutable.Set(tag.get('projects'))
  return tag.set('projects', currentProjects.subtract(projectsToRemove))
}

var addProjectsToTag = (tag, projects) => {
  var currentProjects = Immutable.Set(tag.get('projects'))
  return tag.set('projects', currentProjects.union(projects))
}

var updateTagAndProjects = (tag, selectedProjects) => {
  var allProjectsMap = reactor.evaluate(['projects'])
  var existingsProjects = Immutable.Set(tag.get('projects'))
  var selectedProjects = Immutable.Set(selectedProjects)
  var projectsToRemoveTagFrom = (
    existingsProjects.subtract(selectedProjects)
      .map(d => allProjectsMap.get(d))
      .map(removeTagFromProject.bind(null, tag.get('id'))))
  var tag = removeProjectsFromTag(tag, projectsToRemoveTagFrom)

  var projectsToAddTagTo = (
    selectedProjects.subtract(
      existingsProjects.intersect(selectedProjects)))

  var updatedProjects = (
    projectsToRemoveTagFrom.union(projectsToAddTagTo
     .map(id => allProjectsMap.get(id))
     .map(addTagToProject.bind(null, tag.get('id')))))
  tag = addProjectsToTag(tag, projectsToAddTagTo)
  return { updatedTag: tag, updatedProjects: updatedProjects }
}

// TODO combine common code
var persistTagWithUpdatedProjects = (tag) => {
  if (TEST) { return }
  var projectIdsObj = {}
  tag.get('projects').forEach(d => projectIdsObj[d] = true)
  tagsRef.child(tag.get('id')).update({projects: projectIdsObj})
}

var persistProjectWithUpdatedTags = (project) => {
  if (TEST) { return }
  var tagsObj = {}
  project.get('tags').forEach(id => tagsObj[id] = true)
  projectsRef.child(project.get('id')).update({tags: tagsObj})
}

export default new Nuclear.Store({
  getInitialState() { return Nuclear.toImmutable({}) },

  initialize() {
    this.on('addTag', (state, tag) => {
      return state.set(tag.id, Immutable.fromJS(tag))
    })

    this.on('addManyTags', (state, tags) => {
      return tags.reduce((retVal, tag) => {
        if (tag.projects) {
          tag.projects = Object.keys(tag.projects)
        }
        return retVal.set(tag.id, Immutable.fromJS(tag))
      }, state)
    })

    this.on('loadAdminCreateProjectData', hydrateTags)
    this.on('loadCurrentProjectEditResources', hydrateTags)
    this.on('loadAdminTags', hydrateTags)

    this.on('addProjectsToTag', (state, data) => {
      var tag = data.tag
      var selectedProjects = data.projects
      var { updatedTag, updatedProjects } = updateTagAndProjects(tag, selectedProjects)
      updatedProjects.forEach(d => persistProjectWithUpdatedTags(d))
      persistTagWithUpdatedProjects(updatedTag)
      setTimeout(() => reactor.dispatch('addManyProjects', updatedProjects.toJS()), 100)
      return state.set(tag.get('id'), updatedTag)
    })

    this.on('createTag', (state, newTagName) => {
      var now = new Date().getTime()
      var newTag = {
        name: newTagName,
        createdAt: now,
        updatedAt: now
      }
      var newTagRef = tagsRef.push(newTag)
      newTag.id = newTagRef.key()
      setTimeout(() => reactor.dispatch('addTag', newTag), 50)
      return state
    })
  }
})
