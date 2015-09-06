import React from 'react'
import Router from 'react-router'
import reactor from '../state/reactor'
import {Link} from 'react-router'
import Store from '../state/main'
import {iconPath} from '../utils'

export default React.createClass({
  mixins: [reactor.ReactMixin, Router.State],

  getDataBindings() {
    return {currentUser: ['currentUser']}
  },

  handleGoBack(e) {
    e.preventDefault()
    window.history.back()
  },

  render() {
    var onProjectEdit = (this.isActive('projectEdit') || this.isActive('imageEdit'))
    var currentUser = this.state.currentUser

    return (
      <div className="sub-nav">
        <ul className="sub-nav-container">
            <li className="category-wrapper">
                <span>Categories</span>
                <span> v </span>
            </li>
            <li className="levels-wrapper">
                <span>Levels</span>
                <span> ***** </span>
            </li>
            <li>Trending</li>
            <li>New Releases</li>
        </ul>
      </div>
    )
  }
})
