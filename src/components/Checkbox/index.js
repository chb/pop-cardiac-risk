import React from "react"
import { buildClassName } from "../../lib"
import "./Checkbox.scss"


export default class Checkbox extends React.Component
{
    onClick()
    {
        if (this.props.onChange && !this.props.readOnly) {
            this.props.onChange(!this.props.checked);
        }
    }

    render()
    {
        const {
            checked,
            indeterminate,
            readOnly,
            label,
            ...rest
        } = this.props;

        return (
            <div
                { ...rest }
                className={ buildClassName({
                    "checkbox-wrap": true,
                    indeterminate,
                    checked: !indeterminate && checked,
                    readOnly
                })}
                onClick={() => this.onClick()}
            >
                <div className="checkbox"/>
                { label ?  <div className="checkbox-label">{ label }</div> : null }
            </div>
        )
    }
}
