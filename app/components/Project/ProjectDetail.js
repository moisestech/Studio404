import React from 'react'
import Modal from '../Modal'
import Router from 'react-router'
import reactor from '../../state/reactor'
import getters from '../../state/getters'
import Store from '../../state/main'
import ProjectDetailNav from './ProjectDetailNav'
import {imageUrlForProject, newId} from '../../state/utils'
import {Link, Navigation} from 'react-router';
import {iconPath} from '../../utils';
var RouteHandler = Router.RouteHandler;

var appElement = document.getElementById('app');
Modal.setAppElement(appElement);
Modal.injectCSS()

export default React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },
  
  mixins: [Navigation, reactor.ReactMixin],

  getInitialState() {
    return {
      isOpen: true
    }
  },

  getDataBindings() {
    return {project: Store.getters.currentProject}
  },

  componentWillMount() {
    Store.actions.selectProjectId(this.props.params.projectId)
  },

  shouldComponentUpdate(nextProps, nextState) {
    if (typeof nextState.project.getIn(['images', 0]) === 'string') {
      return true
    }
    if (nextState.project && this.state.project) {
      return this.state.project !== nextState.project
    }
    return true
  },

  transitionToEdit() {
    this.transitionTo('projectEdit', {projectId: projectId, step: 'start'});
  },

  transitionToProjects() {
    this.transitionTo('projects')
  },

  transitionToCart() {
    this.transitionTo('cart', {projectId: this.state.project.get('id')});
  },

  render() {
    var currentProject = reactor.evaluate(getters.currentProject)
    if (currentProject == null ||
        typeof currentProject.getIn(['images', 0]) === 'string') {
      return null
    }

    return (
      <Modal isOpen={this.state.isOpen} onRequestClose={this.closeModal}>
        <h2>Project Detail</h2>
        <ProjectDetailNav/>
        <RouteHandler/>
      </Modal>
    )
  }
})
