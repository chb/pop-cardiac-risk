import React     from "react"
import ReactDOM  from "react-dom"
import PropTypes from "prop-types"
import { withRouter } from "react-router-dom";


class Navigator extends React.Component
{
    static propTypes = {
        location: PropTypes.object,
        children: PropTypes.any
    };

    /**
     * If we are going back to "/", cancel the update so that the page remains
     * as is while it is being animated out of the view. Instead of rendering
     * with React, we just remove the "active" className.
     * @param {object} nextProps 
     */
    shouldComponentUpdate(nextProps)
    {
        if (nextProps.location.pathname === "/") {
            const page = ReactDOM.findDOMNode(this);
            if (page && page instanceof Element) {
                page.classList.remove("active");
                return false
            }
        }
        return true;
    }

    /**
     * If the component was updated, it means we just rendered a page. Make sure
     * it is animated in by adding the "active" class to it.
     */
    componentDidUpdate()
    {
        // console.log("componentDidUpdate")
        const page = ReactDOM.findDOMNode(this);
        if (page && page instanceof Element) {
            setTimeout(() => page.classList.add("active"), 0);
        }
    }

    /**
     * After the initial rendering, check the location and decide if we need to
     * add or remove the "active" class to the page.
     */
    componentDidMount()
    {
        const page = ReactDOM.findDOMNode(this);
        if (page && page instanceof Element) {
            page.classList[this.props.location.pathname === "/" ? "remove" : "add"]("active");
        }
    }

    render()
    {
        return this.props.children;
    }
}

export default withRouter(Navigator);
