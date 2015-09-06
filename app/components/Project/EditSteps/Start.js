import React from 'react'
import reactor from '../../../state/reactor'
import Store from '../../../state/main'
import {iconPath} from '../../../utils'
import {imageUrlForLayer} from '../../../state/utils'
import {Navigation} from 'react-router'
import {Link} from 'react-router'
var classNames = require('classnames')
var imgSize = 120

export default React.createClass({
  mixins: [reactor.ReactMixin, Navigation],
  getDataBindings() {
    return { project: Store.getters.currentProject }
  },

  selectLayer(layerId) {
    Store.actions.selectImageId(layerId)
    this.transitionTo('imageEdit', {projectId: this.state.project.get('id'), imageId: imageId,
                                    imagesOrColors: 'images'})
  },

  render() {
    var isActive = this.props.isActive
    var isSmall = this.props.isSmall
    var images = this.state.project.get('layers').reverse().map(layer => {
      return (
        <div className="layer-selector"
             onClick={this.selectLayer.bind(null, layer.get('id'))}>
          <img src={imageUrlForLayer(layer)} width={imgSize} height={imgSize}
               style={{opacity:1}}
               className={classNames({selected: this.state.currentLayerId === layer.get('id')})}/>
        </div>
        )
    }.bind(this))

    return (
      <div className={classNames('start', {visible: isActive, small: isSmall})}>
        <div className="actions">
        </div>
         {this.props.isActive ?
          <div className="more-options">
            {images}
           </div>
          : null }
      </div>
    )
  }
})
