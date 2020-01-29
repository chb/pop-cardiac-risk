import React from "react"
import { buildClassName } from "../../lib"
import "./Checkbox.scss"


export default class Checkbox extends React.Component
{
    onClick()
    {
        if (this.props.onChange) {
            this.props.onChange(!this.props.checked);
        }
    }

    render()
    {
        const { checked, indeterminate, label, ...rest } = this.props;

        return (
            <div
                { ...rest }
                className={ buildClassName({
                    "checkbox-wrap": true,
                    indeterminate,
                    checked: !indeterminate && checked
                })}
                onClick={() => this.onClick()}
            >
                <div className="checkbox"/>
                { label ?  <div className="checkbox-label">{ label }</div> : null }
            </div>
        )
    }
}
