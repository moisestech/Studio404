var Nuclear = require('nuclear-js')

export default new Nuclear.Store({
  getInitialState() { return '' },

  initialize() {
    this.on('selectImageId', (state, imageId) => imageId)
    this.on('selectProjectAndImageId', (state, ids) => ids.imageId )
  }

})
