import React from 'react'
import Router from 'react-router'
import Project from '../Project/Project'
import reactor from '../../state/reactor'
import Store from '../../state/main'
import Immutable from 'Immutable'

export default React.createClass({
  mixins: [reactor.ReactMixin, Router.Navigation],

  getDataBindings() {
    return { projects: Store.getters.adminCreatedProjects,
             tags: Store.getters.tags,
             tagsMap: ['tags']}
  },

  getInitialState() {
    return { selectedProject: null,
             selectedTag: null,
             editMode: 'editProject',
             selectedProjects: Immutable.Set() }
  },

  componentWillMount() {
    this._interval = setInterval(() => {
      if (!reactor.__isDispatching) {
        clearInterval(this._interval)
        Store.actions.loadAdminCreatedProjects()
        Store.actions.loadAdminTags()
      }
    }, 100)
  },

  componentWillUnmount() {
    clearInterval(this._interval)
  },

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.selectedTag && this.state.tags.count() > 0) {
      var selectedTag = this.state.tags.get(0)
      var newState = {selectedTag: selectedTag}
      if (selectedTag.get('projects') && selectedTag.get('projects').count() > 0) {
        newState.selectedProjects = Immutable.Set(selectedTag.get('projects'))
      }
      this.setState(newState)
    }
    var tagsMap = this.state.tagsMap
    var selectedTag = this.state.selectedTag
    if (selectedTag && tagsMap.get(selectedTag.get('id'))
       && tagsMap.get(selectedTag.get('id')) !== selectedTag) {
      var updatedTag = tagsMap.get(selectedTag.get('id'))
      this.setState({selectedTag:updatedTag})
    }
  },

  clickProject(project, e) {
    var projectId = project.get('id')
    e.preventDefault()
    if (this.state.editMode === 'editProject') {
      this.transitionTo('adminEditProject', {projectId: projectId})
    } else {
      var selectedProjects = this.state.selectedProjects
      if (selectedProjects.includes(projectId)) {
        this.setState({selectedProjects: selectedProjects.remove(projectId)})
      } else {
        this.setState({selectedProjects: selectedProjects.add(projectId)})
      }
    }
  },

  handleAddProjectsToTag() {
    Store.actions.addProjectsToTag({tag: this.state.selectedTag,
                                   projects: this.state.selectedProjects})
  },

  onFormChange(e) {
    this.setState({editMode: e.target.value})
    return {
      projects: Store.getters.projects
    }
  },

  handleTagChange(e) {
    var tag = this.state.tagsMap.get(e.target.value)
    var selectedProjects = Immutable.Set(tag.get('projects'))
    this.setState({selectedTag:tag, selectedProjects:selectedProjects})
  },

  render() {
    var selectDivStyles = {
      width: '100%',
      height: '100%',
      background: '#262323',
      opacity: '0.8',
      position: 'absolute',
      top: '0',
      left: '0'
    }
    let projects = this.state.projects.map(d => {
      var overlayStyles = (
        (() => {
          if (this.state.editMode === 'editProject') { return null }
          else if (this.state.selectedProjects.includes(d.get('id'))) {
            return selectDivStyles }
          else { return null }
        }()))

      return (
        <Project project={d} key={d.get('id')} onClick={this.clickProject.bind(null, d)}/>
      )
    })

    var tagOptions = this.state.tags.map(tag => {
      return (
        <option value={tag.get('id')}>{tag.get('name')}</option>
      )
    })

    var selectedTag = this.state.selectedTag ? this.state.selectedTag.get('id') : ''
    return (
      <div className="main">

        <form onChange={this.onFormChange}>
          <div>
            <label>Edit a project</label>
            <input type="radio" value="editProject" name="editMode"
                   checked={this.state.editMode === 'editProject'}/>
          </div>
          <div>
            <label>Group projects by tag</label>
            <input type="radio" value="groupProjectsByTag"
                   name="editMode" checked={this.state.editMode === 'groupProjectsByTag'}/>
          </div>
        </form>

        { this.state.editMode === 'groupProjectsByTag' ?
          <div style={{padding:'10px'}}>
            <select value={selectedTag} style={{width:'50%'}} onChange={this.handleTagChange}>
              {tagOptions}
            </select>
            <div style={{padding:'10px 0'}}>
              <button onClick={this.handleAddProjectsToTag}>Update Projects</button>
            </div>
          </div>
          : null }

        <ul className="designs">
          {projects}
        </ul>
        <Router.RouteHandler/>
      </div>
    )
  }
})
