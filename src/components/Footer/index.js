import React              from "react"
import PropTypes          from "prop-types"
import { connect }        from "react-redux"
import { formatDuration } from "../../lib"
import "./Footer.scss"


class Footer extends React.Component
{
    static propTypes = {
        patients: PropTypes.number
    };
    
    render()
    {
        return (
            <div className="app-footer">
                Loaded { this.props.patients.toLocaleString() } patients in {
                    formatDuration(
                        this.props.patientsLoadEndTime -
                        this.props.patientsLoadStartTime
                    )
                }
            </div>
        )
    }
}

const ConnectedFooter = connect(state => ({
    patients: state.patients.data.length,
    patientsLoadStartTime: state.patients.patientsLoadStartTime, 
    patientsLoadEndTime: state.patients.patientsLoadEndTime
}))(Footer);

export default ConnectedFooter;
