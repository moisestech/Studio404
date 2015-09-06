import reactor from './reactor'
import usersStore from './stores/users'
import currentUserStore from './stores/currentUser'
import projectsStore from './stores/projects'
import currentProjectIdStore from './stores/currentProjectId'
import imagesStore from './stores/images'
import currentImageIdStore from './stores/currentImageId'
import imageUploadedStore from './stores/imageUploaded'
import imageIsBeingReplacedStore from './stores/imageIsBeingReplaced'
import tagsStore from './stores/tags'
import getters from './getters'
import actions from './actions'
import {idsToObjs, hydrateProject} from './helpers'
import {usersRef, firebaseRef} from './firebaseRefs'
var Nuclear = require('nuclear-js')

reactor.registerStores({
  users: usersStore,
  currentUser: currentUserStore,
  projects: projectsStore,
  currentProjectId: currentProjectIdStore,
  images: imagesStore,
  currentImageId: currentImageIdStore,
  imageUploaded: imageUploadedStore,
  imageIsBeingReplaced: imageIsBeingReplacedStore,
  tags: tagsStore
})

firebaseRef.onAuth(authData => {
  if (authData) {
    usersRef.child(authData.uid).once('value', s => {
      var existingUser = s.val()
      if (existingUser == null) {
        let userData = {
          id: authData.uid,
          name: authData.google.displayName,
          email: authData.google.email,
          isAdmin: false}
        reactor.dispatch('createNewUserAndSetAsCurrent', userData)
      } else {
        existingUser.id = s.key()
        reactor.dispatch('setCurrentUser', existingUser)
      }
    })
  } else {
    console.log("User is logged out");
  }
})

////////////////////////////////////////////////////////////////////////////////
// Exports.
////////////////////////////////////////////////////////////////////////////////

module.exports = {
  getters: getters,
  actions: actions
}


