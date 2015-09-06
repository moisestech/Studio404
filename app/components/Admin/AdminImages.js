import React from 'react'
import Router from 'react-router'
import reactor from '../../state/reactor'
import Store from '../../state/main'
import getters from '../../state/getters'
import Notification from '../Notification'
import { imageUrlForImage } from '../../state/utils'

export default React.createClass({
  mixins: [reactor.ReactMixin],

  getDataBindings() {
    return {images: getters.images}
  },

  getInitialState() {
    return {selectedImage: null,
            errors: [],
            messages: [],
            showDeleteConfirmation: false,
            confirmDeleteText: ''}
  },

  componentWillMount() {
    Store.actions.loadAdminImages()
  },

  selectImage(image) {
    this.setState({selectedImage:image, confirmDeleteText: '', showDeleteConfirmation: false})
  },

  handleShowDeleteConfirmation(){
    this.setState({showDeleteConfirmation: true})
  },

  confirmedDeleteSelectedImage() {
    Store.actions.deleteImage(this.state.selectedImage)
    this.setState({selectedImage: null, confirmDeleteText: '', showDeleteConfirmation: false})
  },

  onConfirmDeleteChange(e) {
    this.setState({confirmDeleteText: e.target.value})
  },

  render() {
    var errors = this.state.errors.map(e => {
      return <p style={{background:'#E85672'}}>{e}</p>
    })

    var messages = this.state.messages.map(m => {
      return <Notification message={m}
                 onClose={() => this.setState({messages:[]})}/>
    })

    var images = this.state.images
        .map(image => {
      var border = this.state.selectedImage === image ? '2px solid' : 'none'

      return (
        <div onClick={this.selectImage.bind(null, image)}
             style={{display: 'inline-block', border: border}} key={image.toJS().id}>
          <img src={imageUrlForImage(image)} height={60} width={60}/>
        </div>
      )
    })

    var labelStyle = { display: 'inline-block', fontWeight: 'bold', marginRight: 20 }
    var infoStyle = { display: 'inline-block'}
    var rowStyle = { margin: '10px 0' }
    var selectedImage = this.state.selectedImage
    var selectedImageInfo = selectedImage ? (
        <div style={{margin: '20px 0'}}>
          <img src={imageUrlForImage(selectedImage)} height={200} width={200}/>
          <div style={rowStyle}>
            <div style={labelStyle}>Created:</div>
            <div style={infoStyle}>{new Date(selectedImage.get('createdAt')).toString()}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Last Updated:</div>
            <div style={infoStyle}>{new Date(selectedImage.get('updatedAt')).toString()}</div>
          </div>
          <div style={rowStyle}>
            <div style={labelStyle}>Image URL:</div><div style={infoStyle}>{selectedImage.get('imageUrl')}</div>
          </div>
          <div style={rowStyle}>

            {!this.state.showDeleteConfirmation ?
              <button onClick={this.handleShowDeleteConfirmation}>DELETE</button> : null}

            {this.state.showDeleteConfirmation ? (
              <div>
                <label>Enter 'yes' to confirm.</label>
                <input type="text" value={this.state.confirmDeleteText} onChange={this.onConfirmDeleteChange}/>
                {this.state.confirmDeleteText === 'yes' ?
                    <button onClick={this.confirmedDeleteSelectedImage}>REALLY DELETE</button> : null}
              </div>
              ) : null}

          </div>
        </div>
    ) : null

    return (
      <div className="admin-layer-images"
           style={{padding:10}}>
        <h1>Images</h1>
        {selectedImageInfo}
        {images}
        {this.state.errors.length > 0 ? <div>{errors}</div> : null}
        {this.state.messages.length > 0 ? <div>{messages}</div> : null}
      </div>
    )
  }
})
