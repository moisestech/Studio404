var config = require('../../config')
var Firebase = require('firebase')
var exports = {}
var fireBaseUri = config.fireBaseUri
exports.fireBaseUri = fireBaseUri

exports.firebaseRef      = new Firebase(fireBaseUri)
exports.usersRef         = new Firebase(fireBaseUri + "/users")
exports.projectsRef      = new Firebase(fireBaseUri + "/projects")
exports.imageIndexRef	 = new Firebase(fireBaseUri + '/imageIndex')
exports.imagesRef   	 = new Firebase(fireBaseUri + "/images")
exports.tagsRef			 = new Firebase(fireBaseUri + "/tags")
exports.credsRef         = new Firebase(fireBaseUri + "/creds")

export default exports
