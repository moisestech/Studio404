import React from 'react'
import reactor from '../../state/reactor'
import Store from '../../state/main'
import RenderLayers from '../Project/RenderLayers'
import RenderLayersCanvas from '../Project/RenderLayersCanvas'
import Immutable from 'Immutable'
import Notification from '../Notification'
import { imageUrlForImage } from '../../state/utils'
import { projectPreviewSize } from '../../../config'

export default React.createClass({
  mixins: [reactor.ReactMixin],

  getDataBindings() {
    return { images: Store.getters.images }
  },

  getInitialState() {
    return {newProject: Immutable.fromJS({imageIndex:[{}, {}, {}], adminCreated: true}),
            currentImageIndex: 0,
            errors: [],
            messages: [],
            w: 400,
            h: 400,
            projectJpgUrl: null}
  },

  componentWillMount() {
    Store.actions.loadAdminCreateProjectData()
  },

  clearMessages() {
    this.setState({messages: []})
  },

  selectImage(image) {
    var imageIndex = this.state.currentImageIndex
    var newProject = this.state.newProject.updateIn(['imageIndex', imageIndex],
      i => i.set('selectedImage', image))
    this.setState({newProject: newProject})
  },

  selectImageIndex(i) {
    this.setState({currentImageIndex: i})
  },

  updateName(e) {
    this.setState({newProject: this.state.newProject.set('name', e.target.value)})
  },

  saveProject(e) {
    e.preventDefault()
    var newProject = this.state.newProject
    var name = this.state.newProject.get('name')
    var errors = []
    var messages = []
    if (!name || name.length === 0) {
      errors.push('You must set a name')}

    var imagesValid = (
      newProject.get('imageIndex')
      .every(l => l.has('selectedImage'))
    )

    if (!imagesValid) {
      errors.push('You must select an image for every image type.')}

    if (errors.length === 0) {
      Store.actions.createNewProject({ project: newProject })
      messages.push('Project successfully created.')}

    this.setState({errors: errors, messages: messages})
  },

  render() {
    
    var images = this.state.images.map(image => {
      var bg = (this.state.newProject.getIn(['imageIndex', this.state.currentImageIndex,
                  'selectedImage']) === image ? 'yellow' : '#fff')
      return (
        <li onClick={this.selectImage.bind(null, image)}
            style={{background:bg}}>
          <img src={imageUrlForImage(image)}/>
        </li>
      )
    })

    var imageIndex = (
      this.state.newProject.get('imageIndex')
        .filter(i => i.has('selectedImage'))
    )

    var errors = this.state.errors.map(e => {
      return <p style={{background:'#E85672'}}>{e}</p>
    })

    var messages = this.state.messages.map(m => {
      return <Notification message={m} onClose={this.clearMessages}/>
    })

    var height = this.state.height
    var width = this.state.width
    var selectImageIndex = [0, 1, 2].map(i => {
      return (
        <div style={{
          background:(this.state.currentImageIndex === i ? 'yellow' : '#fff'),
          border: '1px solid',
          display:'inline-block',
          padding: 10}}
          onClick={this.selectImageIndex.bind(null, i)}>Image Index {i}</div>
      )
    })

    return (
      <div className="admin-create-design">
        {this.state.errors.length > 0 ? <div>{errors}</div> : null}
        {this.state.messages.length > 0 ? <div>{messages}</div> : null}
        <p>New Project</p>

        <label>Select Image Type to edit</label>
        <div style={{padding:20}}>
          {selectImageIndex}
        </div>

        <form onSubmit={this.saveProject}>
          <label>Name</label>
          <input type="text" 
            value={this.state.newProject.get('name')} 
            onChange={this.updateName}></input>
          <input type="submit"></input>
        </form>

        <ul className="select-layer-image">
          {images}
        </ul>
      </div>
    )
  }
})
