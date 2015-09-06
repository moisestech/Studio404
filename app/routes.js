import React from 'react'
import Router from 'react-router'
var Route = Router.Route;

import Admin from './components/Admin'
import AdminProjects from './components/Admin/AdminProjects'
import AdminImages from './components/Admin/AdminImages'
import AdminUsers from './components/Admin/AdminUsers'
import AdminEditProject from './components/Admin/AdminEditProject'
import AdminTags from './components/Admin/AdminTags'
import AdminCreateProject from './components/Admin/AdminCreateProject'
import AdminCreateImage from './components/Admin/AdminCreateImage'

import App from './components/App'
import Projects from './components/Projects'
import ProjectEdit from './components/Project/ProjectEdit'
import ProjectDetail from './components/Project/ProjectDetail'
import ProjectDetailOverview from './components/Project/ProjectDetailOverview'
import ProjectDetailProcess from './components/Project/ProjectDetailProcess'
import ProjectDetailRelated from './components/Project/ProjectDetailRelated'

import Cart from './components/Cart'

export default (
  <Route ignoreScrollBehavior={true} handler={App}>
    <Router.NotFoundRoute handler={Projects} />
    <Router.DefaultRoute handler={Projects}/>

    <Route name="projects" handler={Projects} path="projects/?">
      <Route name="projectDetail" handler={ProjectDetail} path=":projectId/?">
        <Route name="projectDetailOverview" path="overview/?" handler={ProjectDetailOverview}/>
        <Route name="projectDetailProcess" path="process/?" handler={ProjectDetailProcess}/>
        <Route name="projectDetailRelated" path="related/?" handler={ProjectDetailRelated}/>
      </Route>
    </Route>
    
    <Route name="cart" handler={Cart} path="/projects/:projectId/cart/?"/>
    <Route name="projectEdit" handler={ProjectEdit} path="/projects/:projectId/edit/:step/?"/>

    <Route name="admin" handler={Admin} path="admin/?">
      <Route name="adminTags" handler={AdminTags} path="tags/?"/>
      <Route name="adminProjects" handler={AdminProjects} path="projects/?"/>
      <Route name="adminCreateProject" handler={AdminCreateProject} path="createProject/?"/>
      <Route name="adminEditProject" handler={AdminEditProject} path="projects/:projectId/edit/?"/>
      <Route name="adminImages" handler={AdminImages} path="images/?"/>
      <Route name="adminUsers" handler={AdminUsers} path="users/?"/>
      <Route name="adminCreateImage" handler={AdminCreateImage} path="uploadImage/?"/>
    </Route>
  </Route>
)
