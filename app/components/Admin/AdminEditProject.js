import React from 'react'
import reactor from '../../state/reactor'
import Store from '../../state/main'
import Immutable from 'Immutable'
import Notification from '../Notification'
import Router from 'react-router'
import { imageUrlForImage } from '../../state/utils'
import { projectPreviewSize } from '../../../config'

export default React.createClass({
  mixins: [
    reactor.ReactMixin, 
    Router.State, 
    Router.Navigation],

  getDataBindings() {
    return {
      existingProject: Store.getters.currentProject,
      images: Store.getters.images}
  },

  getInitialState() {
    return {editingProject: null,
            currentImageIndex: 0,
            errors: [],
            messages: [],
            width: 400,
            height: 400,
            projectJpgUrl: null,
            showDeleteConfirmation: false,
            confirmDeleteText: ''}
  },

  componentWillMount() {
    setTimeout(() => {
      if ((!this.state.editingProject || this.projectIsNotHydrated()) && this.state.existingProject &&
          this.getParams().projectId === this.state.existingProject.get('id')) {
        setTimeout(() => this.setState({editingProject: this.state.existingProject}), 200)
      } else {
        Store.actions.selectProjectId(this.props.params.projectId)
        Store.actions.loadAdminCreateProjectData()
      }
    }, 50)
  },

  componentDidUpdate(prevProps, prevState) {
    if ((!this.state.editingProject || this.projectIsNotHydrated()) && this.state.existingProject) {
      setTimeout(() => this.setState({editingProject: this.state.existingProject}), 200)
    }
  },

  clearMessages() {
    this.setState({messages: []})
  },

  selectImage(image) {
    var imageIndex = this.state.currentImageIndex
    var editingProject = this.state.editingProject.updateIn(['imageIndex', imageIndex],
      l => l.set('selectedImage', image))
    this.setState({editingProject: editingProject})
  },

  selectImageIndex(i) {
    this.setState({currentImageIndex: i})
  },

  updateName(e) {
    this.setState({editingProject: this.state.editingProject.set('name', e.target.value)})
  },

  saveProject(e) {
    e.preventDefault()
    var name = this.state.editingProject.get('name')
    var errors = []
    var messages = []
    if (!name || name.length === 0) {
      errors.push('You must set a name')
    }
    var imagesValid = (
      this.state.editingProject.get('imageIndex')
      .map(i => i.has('selectedImage'))
      .every(v => v)
    )
    if (!imagesValid) {
      errors.push('You must select an image for every image index.')
    }

    if (errors.length === 0) {
      console.log('--ADMIN-EDIT-PROJECT--')
      console.log(this.state.editingProject.toJS())
      Store.actions.updateProject({ project: this.state.editingProject })
      messages.push('Project successfully saved.')
    }
    this.setState({errors: errors, messages: messages})
  },

  projectIsNotHydrated() {
    var editingProject = this.state.editingProject
    return !(editingProject &&
            editingProject.get('imageIndex').every(l => typeof l === 'object' && l.has('selectedImage'))
            )
  },

  handleShowDeleteConfirmation(){
    this.setState({showDeleteConfirmation: true})
  },

  onConfirmDeleteChange(e) {
    this.setState({confirmDeleteText: e.target.value})
  },

  confirmedDeleteProject() {
    Store.actions.deleteProject(this.state.existingProject)
    this.transitionTo('adminProjects')
  },

  render() {
    if (this.projectIsNotHydrated()) { return null }

    var images = this.state.images.map(image => {
      var bg = (this.state.editingProject.getIn(['imageIndex',this.state.currentImageIndex,
                  'selectedImage', 'id']) === image.get('id') ? 'yellow' : '#fff')
      return (
        <li onClick={this.selectImage.bind(null, image)}
            style={{background:bg}}>
          <img src={imageUrlForImage(image)}/>
        </li>
      )
    })

    var imageIndex = (
      this.state.editingProject.get('imageIndex')
        .filter(l => l.has('selectedImage')))

    var errors = this.state.errors.map(e => {
      return <p style={{background:'#E85672'}}>{e}</p>
    })

    var messages = this.state.messages.map(m => {
      return <Notification message={m} onClose={this.clearMessages}/>
    })

    var height = this.state.height
    var width = this.state.width
    var selectImageIndex = [0,1,2].map(i => {
      return (
        <div style={{
          background:(this.state.currentImageIndex === i ? 'yellow' : '#fff'),
          border: '1px solid',
          display:'inline-block',
          padding: 10}}
          onClick={this.selectImageIndex.bind(null, i)}>Image {i}</div>
        )
    })

    return (
      <div className="admin-create-design">
        {this.state.errors.length > 0 ? <div>{errors}</div> : null}
        {this.state.messages.length > 0 ? <div>{messages}</div> : null}
        <p>Edit Project:</p>

        {!this.state.showDeleteConfirmation ?
          <div><button onClick={this.handleShowDeleteConfirmation}>DELETE</button></div> : null}

        {this.state.showDeleteConfirmation ? (
          <div>
            <label>Enter 'yes' to confirm.</label>
            <input type="text" value={this.state.confirmDeleteText} onChange={this.onConfirmDeleteChange}/>
            {this.state.confirmDeleteText === 'yes' ?
                <button onClick={this.confirmedDeleteProject}>REALLY DELETE</button> : null}
          </div>
          ) : null}

        <label>Select project to edit</label>
        <div style={{padding:20}}>
          {selectImageIndex}
        </div>

        <form onSubmit={this.saveProject}>
          <label>Name</label>
          <input type="text" value={this.state.editingProject.get('name')} onChange={this.updateName}></input>
          <input type="submit"></input>
        </form>

        <ul className="select-layer-image">
          {images}
        </ul>
      </div>
    )
  }
})
