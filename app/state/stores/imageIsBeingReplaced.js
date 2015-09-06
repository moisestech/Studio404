var Nuclear = require('nuclear-js');
export default new Nuclear.Store({
  getInitialState() { return false },

  initialize() {
   this.on('imageReplacementComplete', () => false)
   this.on('imageReplacementStarted', () => true)
  }
})
