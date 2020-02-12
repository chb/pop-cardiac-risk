import React            from "react"
import PropTypes        from "prop-types"
import { connect }      from "react-redux"
import { withRouter }   from "react-router-dom"
import moment           from "moment"
import ClientContext    from "../../ClientContext"
import HDL              from "./HDL"
import TotalCholesterol from "./TotalCholesterol"
import HSCRP            from "./hsCRP"
import SBP              from "./SBP"
import "./PopulationView.scss"


export class PopulationViewHeader extends React.Component
{
    static propTypes = {
        startDate: PropTypes.any,
        endDate  : PropTypes.any,
        groupBy  : PropTypes.string
    };

    static defaultProps = {
        startDate: moment().subtract(2, "years"),
        endDate  : moment(),
        groupBy  : "gender"
    };

    constructor(props)
    {
        super(props);

        this.state = {
            startDate: this.props.startDate,
            endDate  : this.props.endDate,
            groupBy  : this.props.groupBy
        };

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(e)
    {
        e.preventDefault();
        if (typeof this.props.onSubmit == "function") {
            this.props.onSubmit(this.state);
        }
    }

    render()
    {
        const dateFormat = "YYYY-MM-DD";
        const { startDate, endDate, groupBy } = this.state;

        return (
            <header className="text-center">
                <form onSubmit={ this.onSubmit }>
                    <div className="row">
                        <div className="col-xs-6 col-sm-3 text-left">
                            <label>From</label>
                            <input
                                type="date"
                                className="form-control"
                                // min={ moment().subtract(10, "years").format(dateFormat) }
                                max={ moment(endDate).subtract(1, "day").format(dateFormat) }
                                value={ startDate.format(dateFormat) }
                                onChange={ e => this.setState({ startDate: moment(e.target.valueAsDate )}) }
                            />
                        </div>
                        <div className="col-xs-6 col-sm-3 text-left">
                            <label>To</label>
                            <input
                                type="date"
                                className="form-control"
                                min={ moment(startDate).add(1, "day").format(dateFormat) }
                                // max={ moment().format(dateFormat) }
                                value={ endDate.format(dateFormat) }
                                onChange={ e => this.setState({ endDate: moment(e.target.valueAsDate )}) }
                            />
                        </div>
                        <div className="col-xs-6 col-sm-3 text-left">
                            <label>Group By</label>
                            <select
                                className="form-control"
                                value={groupBy}
                                onChange={ e => this.setState({ groupBy: e.target.value }) }
                            >
                                <option value="none">None</option>
                                <option value="gender">Gender</option>
                                <option value="age">Age</option>
                                <option value="race">Race</option>
                            </select>
                        </div>
                        <div className="col-xs-6 col-sm-3">
                            <label>&nbsp;</label>
                            <button type="submit" className="btn btn-primary btn-small btn-block">Apply</button>
                        </div>
                    </div>
                </form>
            </header>
        );
    }
}

// -----------------------------------------------------------------------------

export class PopulationView extends React.Component
{
    static propTypes = {
        patientsLoading: PropTypes.bool,
        patientsError  : PropTypes.instanceOf(Error),
        patientsData   : PropTypes.arrayOf(PropTypes.object)
    };

    constructor(props)
    {
        super(props)
        this.state = {
            startDate: moment().subtract(5, "years"),
            endDate  : moment(),
            groupBy  : "gender"
        }
    }

    render()
    {
        const { patientsLoading, patientsError, patientsData } = this.props;

        if (patientsLoading) {
            return (
                <div className="center" style={{ color: "#FFF" }}>
                    <div>
                        <i className="loader"/> Loading patients...
                    </div>
                </div>
            )
        }

        if (patientsError) {
            return <div className="center">{String(patientsError)}</div>
        }

        if (!patientsData.length) {
            return <div className="center">No patients found</div>
        }

        return (
            <div className="page population-view active">
                <div>
                    {/* <h1>Population Dashboard</h1> */}
                    <PopulationViewHeader
                        startDate={ this.state.startDate }
                        endDate={ this.state.endDate }
                        groupBy={ this.state.groupBy }
                        onSubmit={ data => this.setState(data) }
                    />
                    <SBP
                        startDate={ this.state.startDate }
                        endDate={ this.state.endDate }
                        groupBy={ this.state.groupBy }
                    />
                    <HDL
                        startDate={ this.state.startDate }
                        endDate={ this.state.endDate }
                        groupBy={ this.state.groupBy }
                    />
                    <TotalCholesterol
                        startDate={ this.state.startDate }
                        endDate={ this.state.endDate }
                        groupBy={ this.state.groupBy }
                    />
                    <HSCRP
                        startDate={ this.state.startDate }
                        endDate={ this.state.endDate }
                        groupBy={ this.state.groupBy }
                    />
                </div>
            </div>
        );
    }
}

// -----------------------------------------------------------------------------

class Wrapper extends React.Component
{
    render()
    {
        return (
            <ClientContext.Consumer>
                { client => <PopulationView { ...this.props } client={ client }/> }
            </ClientContext.Consumer>
        );
    }
}

// -----------------------------------------------------------------------------

const ConnectedPopulationView = connect(
    state => ({
        patientsLoading: state.patients.loading,
        patientsError  : state.patients.error,
        patientsData   : state.patients.data
    })
)(Wrapper);

// -----------------------------------------------------------------------------

export default withRouter(ConnectedPopulationView);
