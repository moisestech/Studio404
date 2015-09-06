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
      <div className="nav-bar">
        <div className="nav-bar-container">

          <div className="left-side">
            <Link to="projects" className="logo">
              <img className="space" src={iconPath('art404_logo_transparent_white.png')} height={40} width={30}/>
            </Link>

            {onProjectEdit ? (
              <img src={iconPath('back.svg')}
                className="space"
                height={30} width={30}
                onClick={this.handleGoBack}/> ) : null}

            {onProjectEdit ? (
              <img src={iconPath('refresh.svg')}
                   className="space"
                   height={30} width={30}
                   onClick={this.handleReset}/>
               ) : null}
          </div>

          <div className="right-side">
            {onProjectEdit ? (
               <span className="space price">$75</span>) : null}
            {onProjectEdit ? (
              <img src={iconPath('buy.svg')}
                   className="buy"
                   height={50} width={70}
                   onClick={this.handleBuy}/>
               ) : null}

            {this.state.currentUser ? (
              <ul className="current-user">
                <li className="user-info">
                  <span>{currentUser.get('email')}</span>
                  <span>{currentUser.get('name')}</span>
                </li>
                <li>
                  <img className="user-avatar" src={iconPath('avatar.svg')} />
                </li>
                <ul className="user-social">
                  <li><img src={iconPath('gmail_logo.png')}/></li>
                  <li><img src={iconPath('github_logo.png')}/></li>
                  <li><img src={iconPath('twitter_logo.png')}/></li>
                  <li><img src={iconPath('linkedin_logo.png')}/></li>
                </ul>
              </ul>
            ) : null}

              <div className="share">
                <img src={iconPath('share-icon.svg')} height={25} width={25}/>
              </div>
          </div>
        </div>
      </div>
    )
  }
})
