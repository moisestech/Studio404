import React from 'react';
import Router from 'react-router';
var Link = Router.Link;

export default React.createClass({
	render() {
		console.log("--THIS.PROPS--");
		console.log(this.props);
		console.log("--THIS.PROPS.PARAMS--");
		console.log(this.props.params);

		// var category = this.props.params.category;
		// var name = this.props.params.name;
		// console.log(category);
		// console.log(name);
		

		return (
			<ul>
				<Link to="projectDetailOverview">OVERVIEW</Link>
				<Link to="projectDetailProcess">PROCESS</Link>
				<Link to="projectDetailRelated">RELATED</Link>
			</ul>
		)
	}
});