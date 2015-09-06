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
      <div className="side-nav">
        <ul className="side-nav-container">
            <ul className="category-link projects main">
            	<li>Studio</li>
            </ul>
            <ul className="category-link apps">
            	<li>
            		<img src={iconPath('category-apps.svg')}/>
            	</li>
            	<li>Apps</li>
            </ul>
            <ul className="category-link sculpture">
            	<li>
            		<img src={iconPath('category-sculpture.svg')}/>
            	</li>
            	<li>Sculpture</li>
            </ul>
            <ul className="category-link installation">
            	<li>
            		<img src={iconPath('category-installation.svg')}/>
            	</li>
            	<li>Installation</li>
            </ul>
            <ul className="category-link performance">
            	<li>
            		<img src={iconPath('category-performance.svg')}/>
            	</li>
            	<li>Performance</li>
            </ul>
            <ul className="category-link videos">
            	<li>
            		<img src={iconPath('category-videos.svg')}/>
            	</li>
            	<li>Videos</li>
            </ul>
            <ul className="category-link games">
            	<li>
            		<img src={iconPath('category-games.svg')}/>
            	</li>
            	<li>Games</li>
            </ul>
            <ul className="category-link store">
            	<li>
            		<img src={iconPath('category-store.svg')}/>
            	</li>
            	<li>Store</li>
            </ul>
        </ul>
      </div>
    )
  }
})
