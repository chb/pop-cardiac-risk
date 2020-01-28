import React from "react"
import PropTypes from "prop-types"
import { roundToPrecision, buildClassName } from "../../lib";
import "./Slider.scss"

const hasTouch = "ontouchstart" in document;


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
            label: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.element
            ]).isRequired,
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
        // No pan on touch devices
        e.preventDefault();

        const clientX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
        const left = this.dragState.rect.left;
        const x = Math.min(
            Math.max(clientX + this.dragState.diffX - left, 0),
            this.dragState.rect.width
        );

        // Convert the coordinates to value respecting the internal rounding
        // rules and if the result is different than the current one call the
        // onChange handler
        const value = this.offsetToValue(x);
        if (value !== this.props.value) {
            this.props.onChange(value);
        }
    }

    onMouseUp()
    {
        // Stop dragging
        window.removeEventListener("touchmove", this.onMouseMove);
        window.removeEventListener("mousemove", this.onMouseMove);

        // In case "once" is not supported
        window.removeEventListener("touchend", this.onMouseUp);
        window.removeEventListener("mouseup" , this.onMouseUp);
    }

    onMouseDown(e)
    {
        // On desktop preventDefault to disable selection
        if (e.type === "mousedown") {
            e.preventDefault();
        }

        // Do nothing if onChange function is not passed in props
        if (this.props.onChange) {

            // Compute the distance between the start event and the center of
            // the button to prevent "jumping to the center" on first move.
            // Also measure and store the parent rect so that we don't have to
            // do that on every move event 
            const x = e.type === "mousedown" ? e.clientX : e.nativeEvent.touches[0].clientX;
            const rect = this.btn.current.getBoundingClientRect();
            const diffX = (rect.left + rect.width/2) - x;
            this.dragState = {
                diffX,
                rect: this.wrapper.current.getBoundingClientRect()
            };

            // Now that we are ready to handle drag, listen to move and end
            // events.
            if (e.type === "mousedown") {
                window.addEventListener("mousemove", this.onMouseMove);
                window.addEventListener("mouseup", this.onMouseUp, { once: true });
            } else {
                // On touch devices user's finger will cover the number that is
                // rendered inside the button. We want the user to be able to
                // move his down and out of the button without scrolling the
                // page. To do so, we need to call preventDefault, thus we have
                // to use { passive: false } for the touchmove listener.
                window.addEventListener("touchmove", this.onMouseMove, { passive: false });
                window.addEventListener("touchend", this.onMouseUp, { once: true });
            }
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
                        onMouseDown={ hasTouch ? null : this.onMouseDown }
                        onTouchStart={ hasTouch ? this.onMouseDown : null }
                    >{ hasValue ? roundToPrecision(value, precision) : "N/A" }</div>
                    {
                        zones.map((z, i) => (
                            <div key={`zone-${i}`} className="slider-zone" style={{
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
