var Nuclear = require('nuclear-js');
import reactor from '../reactor'
import {projectsRef} from '../firebaseRefs'

export default new Nuclear.Store({
  getInitialState() { return '' },

  handleSelectProjectId(state, projectId) {
    if (state === projectId) {
      return projectId
    }
    return projectId
  },

  initialize() {
    this.on('selectProjectId', this.handleSelectProjectId)
    this.on('selectProjectAndLayerId', (state, ids) => this.handleSelectProjectId(state, ids.projectId))
  }
})
