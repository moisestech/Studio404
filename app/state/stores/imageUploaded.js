var Nuclear = require('nuclear-js')

export default new Nuclear.Store({
  getInitialState() { return null },

  initialize() {
   this.on('imageUploadedSuccessfully', (state, image) => {
     return image
   })
  }
})
