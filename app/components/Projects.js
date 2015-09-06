import React from 'react'
import Router from 'react-router'
import Project from './Project/Project'
import reactor from '../state/reactor'
import Store from '../state/main'
import {Link} from 'react-router'
import {Navigation} from 'react-router'

export default React.createClass({
  mixins: [Router.Navigation, reactor.ReactMixin],

  getDataBindings() {
    return { projects: Store.getters.adminCreatedProjects }
  },

  componentWillMount() {
    Store.actions.loadAdminCreatedProjects()
  },

  selectProject(projectId, e) {
    this.transitionTo('projectDetail', {projectId: projectId})
  },

  render() {
    var styles = [
      'background: red;',
      'color: white;'
    ]
    console.log('%c RENDERING-PROJECTS', styles)

    let projects = this.state.projects.map(p => {
      console.log(p.get('id'))
      return (
        <Project project={p} onClick={this.selectProject.bind(null, p.get('id'))} key={p.get('id')}/>
      )
    })

    return (
      <div className="main">
        <div className="category-wrapper">
          <h3 className="category-title">New + Updated Apps</h3>
          <ul className="projects">
            {projects}
          </ul>
        </div>
        <Router.RouteHandler/>
      </div>
    )
  }
})
