import React              from "react"
import PropTypes          from "prop-types"
import { connect }        from "react-redux"
import { formatDuration } from "../../lib"
import "./Footer.scss"


class Footer extends React.Component
{
    static propTypes = {
        patients: PropTypes.number,
        start   : PropTypes.number,
        end     : PropTypes.number
    };
    
    render()
    {
        const { patients, patientsLoadEndTime, patientsLoadStartTime, start, end } = this.props;
        return (
            <div className="app-footer">
                Loaded { patients.toLocaleString() } patients in {
                    formatDuration(patientsLoadEndTime - patientsLoadStartTime)
                }
                {
                    (start || start === 0) && (end || end === 0) ?
                        ` [${start} - ${end}]` :
                        null
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
