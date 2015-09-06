import React from 'react'
import Store from '../../state/main'
import reactor from '../../state/reactor'
import { s3UrlForImage } from '../../state/utils'
import { imagesRef } from '../../state/firebaseRefs'
import Notification from '../Notification'

export default React.createClass({
  mixins: [reactor.ReactMixin],
  getDataBindings() {
    return {imageUploaded: ['imageUploaded']}
  },

  getInitialState() {
    return {file: null,
            fileUrl: null,
            isUploadInProgress: false,
            errors: [],
            messages: []}
  },

  componentDidUpdate(prevProps, prevState) {
    var imageUploaded = this.state.imageUploaded
    if (imageUploaded != null && prevState.imageUploaded !== imageUploaded) {
      var messages = [`Image successfully uploaded at url: ${imageUploaded.get('imageUrl')}`]
      this.setState({messages: messages, isUploadInProgress: false})
    }
  },

  setIfImageIsNew(propName, file) {
      var imageUrl = s3UrlForImage(file.name)
      imagesRef.orderByChild(propName).equalTo(imageUrl).once('value', snapshot => {

        var existingImageUrl = snapshot.val()
        if (existingImageUrl != null) {
          this.setState({errors: [`An image already exists with that URL: ${imageUrl}`]})
          return
        }

        var self = this
        var reader = new FileReader()
        reader.onloadend = e => {
          if ('srcElement' in e && 'result' in e.srcElement) {
            var newState = (propName === 'imageUrl' ?
               {file: file,
                fileUrl: URL.createObjectURL(file)}
               : {compositeFile: file,
                  compositeFileUrl: URL.createObjectURL(file)}
              )
              this.setState(newState)
          }
        }
        reader.readAsText(file)
      })
    },

  fileSelected(imageProp, e) {
    if (e.target.files.length > 0) {
      var file = e.target.files[0]
      var errors = []
      if (file.type !== 'image/png') {
        errors.push('You can only use png image file types.')
      } else {
        this.setIfImageIsNew(imageProp, file)
      }
      this.setState({errors: errors})
    }
  },

  uploadFile(e) {
    e.preventDefault()
    if (!this.state.isUploadInProgress) {
      this.setState({isUploadInProgress: true})
      console.log('--THIS.STATE.FILE--')
      console.log(this.state.file)
      Store.actions.uploadImageToS3({ file: this.state.file})
    }
  },

  clearMessages() {
    this.setState({messages: []})
  },

  render() {
    var file = this.state.file
    var fileInfo = file ? (
        <div>
          <p>File name: {file.name}</p>
          <p>File size: {file.size / 1024}K</p>
          <p>File type: {file.type}</p>
          <p><img src={this.state.fileUrl} width={200} height={200}/></p>
        </div>
      ) : null

    var errors = this.state.errors.map(e => {
      return <p style={{background:'#E85672'}}>{e}</p>
    })

    var messages = this.state.messages.map(m => {
      return <Notification message={m} onClose={this.clearMessages}/>
    })

    return (
      <div className="admin-create-layer-image">
        {this.state.errors.length > 0 ? <div>{errors}</div> : null}
        {this.state.messages.length > 0 ? <div>{messages}</div> : null}

        <h1>New Image</h1>

        <form onSubmit={this.uploadFile}>

          <div>
            <div style={{margin: 20}}>
              <label>Upload a new image</label>
            </div>

            <input type="file" onChange={this.fileSelected.bind(null, 'imageUrl')}></input>

            {fileInfo}
          </div>

            {file ? (
              <div style={{padding: 30, background: 'slategray'}}>
                <input type="submit" value="Upload"></input>
              </div>)
              : null}
        </form>

      </div>
    )
  }
})
