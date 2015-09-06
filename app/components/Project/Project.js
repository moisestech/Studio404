import React from 'react'
import Router from 'react-router'
import reactor from '../../state/reactor'
import State from '../../state/main'
import {imageUrlForProject, imageUrlForImage } from '../../state/utils'
import {iconPath} from '../../utils'
import Modal from '../Modal';
var Link = Router.Link
var RouteHandler = Router.RouteHandler
var Navigation = Router.Navigation

var appElement = document.getElementById('app');
Modal.setAppElement(appElement);
Modal.injectCSS();

export default React.createClass({
  mixins: [Navigation],
  getInitialState() {
    return {
      isOpen: true
    }
  },

  componentDidMount() {
    var self = this
    window.addEventListener('resize', () => {
      if (self.isMounted()) { self.forceUpdate() }
    })
  },

  closeModal() {
    this.transitionTo('category', {category: this.props.params.category});
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.project !== nextProps.project
  },

  render() {
    var imgSize = (() => {
      var w = window.innerWidth
       if (w > 900)      { return 180 }
       else if (w > 650) { return 120 }
       else              { return 100 }
    }())

    console.log(this.props.project)

    return (
      <ul className="project" onClick={this.props.onClick}>
        <ul className="top-info">
          <li>
            <img src={iconPath('default-project.svg')} />
          </li>
          <li>{this.props.project.get('name')}</li>
        </ul>
        
        <span className="project-preview-image">
          <img src={imageUrlForProject(this.props.project, 'small')} width={imgSize} height={imgSize}/>
        </span>

        <ul className="bottom-info">
          <li>
            More project info
          </li>
          <li>*****</li>
        </ul>
      </ul>
    )
  }
})
