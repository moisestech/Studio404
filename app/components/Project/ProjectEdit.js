import React from 'react'
import reactor from '../../state/reactor'
import Router from 'react-router'
import Store from '../../state/main'
import SVGInlineLayer  from '../SVGInlineLayer'
import Start from './EditSteps/Start'
import RenderLayers from './RenderLayers'
import EditFooter from './EditFooter'
import {isInvalidEditStep} from '../../utils'

export default React.createClass({
  mixins: [reactor.ReactMixin, Router.State, Router.Navigation],

  getDataBindings() {
    return {
      project: Store.getters.currentProject,
      currentImageIndex: Store.getters.currentImageIndex
    }
  },

  componentWillMount() {
    if (isInvalidEditStep(this.state.validEditSteps,
        this.props.params.step, this.props.params.imagesOrColors)) {
       window.setTimeout(() => {
        this.transitionTo('projects')
      }.bind(this), 0)
      return
    }
    if (this.props.params.layerId) {
      Store.actions.selectProjectAndLayerId({
        projectId: this.props.params.projectId, 
        imageId: this.props.params.imageId})
    } else {
      Store.actions.selectProjectId(this.props.params.projectId)
    }
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.project && this.state.project) {
      var getParams = this.getParams()
      var propParams = this.props.params
      return (this.state.project         !== nextState.project  ||
              propParams.step           !== getParams.step    ||
              propParams.imageId        !== getParams.imageId ||
              propParams.imagesOrColors !== getParams.imagesOrColors)
    }
    return true;
  },

  componentWillUpdate(nextProps) {
    if (this.getParams().imageId &&
        this.props.params.imageId !== this.getParams().imageId) {
      Store.actions.selectImageId(this.getParams().imageId)}
  },

  attemptLoadResources() {
    this._interval = setInterval(() => {
      var svgs = document.querySelectorAll('.canvas svg')
      if (svgs.length === 3) {
        clearInterval(this.state.interval)
        Store.actions.loadCurrentProjectEditResources()
      }
    }, 50)
  },

  componentDidMount() {
    this.attemptLoadResources()
  },

  componentWillUnmount() {
    clearInterval(this._interval)
  },

  render() {
    if (this.state.project == null || this.state.currentImageIndex == null) { return null }

    return (
      <section className="main design-edit">

        <div className="canvas-flex-wrapper">
          <RenderLayers layers={this.state.project.get('imageIndex')}/>
        </div>

        <div className="edit-ui">
          Edit UI
        </div>
      </section>
    )
  }
})
