import React from "react"
import "./Loader.scss"


export default class Loader extends React.Component
{
    render() {
        return (
            <span { ...this.props }>
                <i className={ "glyphicon glyphicon-refresh spin loader-icon" }></i>
            </span>
        );
    }
}