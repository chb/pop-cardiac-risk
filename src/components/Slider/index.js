import React from "react"
import PropTypes from "prop-types"
import { roundToPrecision, buildClassName } from "../../lib";
import "./Slider.scss"


export default class Slider extends React.Component
{
    static propTypes = {
        label    : PropTypes.string,
        value    : PropTypes.number,
        small    : PropTypes.bool,
        onChange : PropTypes.func,
        disabled : PropTypes.bool,
        precision: PropTypes.number,
        zones: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string.isRequired,
            min  : PropTypes.number.isRequired,
            max  : PropTypes.number.isRequired,
            color: PropTypes.string.isRequired
        }))
    };

    static defaultProps = {
        precision: 0,
        zones: [{
            min  : 0,
            max  : 1,
            color: "#CCC"
        }]
    };

    constructor(props)
    {
        super(props);

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp   = this.onMouseUp.bind(this);

        this.btn = React.createRef();
        this.wrapper = React.createRef();

        this.dragState = {};
    }

    onMouseMove(e)
    {
        const left = this.dragState.rect.left;
        const x = Math.min(
            Math.max(e.clientX + this.dragState.diffX - left, 0),
            this.dragState.rect.width
        );
        const value = this.offsetToValue(x);
        if (value !== this.props.value) {
            this.props.onChange(value);
        }
    }

    onMouseUp()
    {
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mouseup", this.onMouseUp);
    }

    onMouseDown(e)
    {
        e.preventDefault();
        if (this.props.onChange) {
            const rect = this.btn.current.getBoundingClientRect();
            const diffX = (rect.left + rect.width/2) - e.clientX;

            this.dragState = {
                diffX,
                rect: this.wrapper.current.getBoundingClientRect()
            };

            window.addEventListener("mousemove", this.onMouseMove);
            window.addEventListener("mouseup", this.onMouseUp);
        }
    }

    valueToPct(val)
    {
        const zones = this.props.zones;
        const min = zones[0].min;
        const max = zones[zones.length - 1].max;
        const range = max - min;
        return val / range * 100
    }

    offsetToValue(offset)
    {
        const zones = this.props.zones;
        const min   = zones[0].min;
        const max   = zones[zones.length - 1].max;
        const range = max - min;
        const width = this.wrapper.current.clientWidth;
        return roundToPrecision(range * offset / width, this.props.precision);
    }

    render()
    {
        const { label, value, small, disabled, precision } = this.props;
        const zones = this.props.zones;
        const hasValue = value || value === 0;

        return (
            <div className={ buildClassName({
                "slider-wrap": true,
                "small": small,
                "disabled": disabled || !hasValue
            }) } ref={ this.wrapper }>
                <div>{ label }</div>
                <div className="slider-zones">
                    <div
                        ref={ this.btn }
                        className="slider-value"
                        style={{ left: this.valueToPct(value || 0) + "%" }}
                        onMouseDown={ this.onMouseDown }
                    >{ hasValue ? roundToPrecision(value, precision) : "N/A" }</div>
                    {
                        zones.map(z => (
                            <div className="slider-zone" style={{
                                width: this.valueToPct(z.max - z.min) + "%"
                            }}>
                                <div className="slider-zone-color"  style={{
                                    background: z.color,
                                    color: z.color
                                }}/>
                                <div className="slider-zone-label hidden-xs">{ z.label }</div>
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    }
}
