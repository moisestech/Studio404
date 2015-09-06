import React from 'react'
import {RouteHandler} from 'react-router'
import Nav from './Nav'
import SideNav from './SideNav'
import SubNav from './SubNav'
import s from '../styles/main.scss'
import Router from 'react-router'

export default React.createClass({
  mixins: [Router.State],

  componentWillMount() {
    document.addEventListener('DOMContentLoaded', () => FastClick.attach(document.body))
  },
  render() {
    return (
      <div>
        <Nav/>
        <SideNav/>
        <SubNav/>
        <RouteHandler/>
      </div>
    )
  }
})
