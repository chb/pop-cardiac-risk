import React               from 'react'
import PropTypes           from "prop-types"
import { connect }         from "react-redux"
import Footer from "../Footer/"
import { search, sort } from "../../store/patients"
import { getAge, highlight } from '../../lib';
import { Link, withRouter } from "react-router-dom";
import Loader from "../Loader/"
import "./PatientList.scss"


class PatientList extends React.Component
{
    static propTypes = {
        error: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.instanceOf(Error)
        ]),
        loading          : PropTypes.bool,
        data             : PropTypes.arrayOf(PropTypes.object),
        match            : PropTypes.object,
        offscreenRows    : PropTypes.number,
        search           : PropTypes.string,
        sort             : PropTypes.string
    };

    static defaultProps = {
        offscreenRows: 20
    };

    constructor(props)
    {
        super(props);

        this.state = {
            startIndex  : 0,
            endIndex    : 15,
            skipTop     : 0,
            skipBottom  : 0,
            scrollHeight: 0,
            windowLength: 1,
            rowHeight   : 10
        };

        this.wrapper = React.createRef();

        this.onScroll = this.onScroll.bind(this);
    }

    computeScrollState()
    {
        const { scrollTop, scrollHeight, clientHeight } = this.wrapper.current;
        const { offscreenRows } = this.props;
        let { rowHeight } = this.state;

        const nextState = { skipTop: 0, skipBottom: 0, scrollHeight };

        // When called for the first time, measure the height of the first
        // (and only) child element and use that to set `rowHeight`
        if (this.state.windowLength === 1) {
            rowHeight = nextState.rowHeight = this.wrapper.current.querySelector(".patient").offsetHeight;
        }

        // find how many rows are off-screen above the top edge
        const topOffscreenRows = Math.floor(scrollTop / rowHeight);

        // If more than `offscreenRows` have become invisible, keep 
        // `offscreenRows` number of rows and replace the rest with an empty
        // div to free those DOM elements
        if (topOffscreenRows > offscreenRows) {
            nextState.skipTop = topOffscreenRows - offscreenRows;
        }

        // find how many rows are off-screen below the bottom edge
        const bottomOffscreenRows = Math.floor(
            (scrollHeight - (clientHeight + scrollTop)) / rowHeight
        );

        // If more than `offscreenRows` have become invisible, keep 
        // `offscreenRows` number of rows and replace the rest with an empty
        // div to free those DOM elements
        if (bottomOffscreenRows > offscreenRows) {
            nextState.skipBottom = bottomOffscreenRows - offscreenRows;
        }

        nextState.windowLength = Math.ceil(clientHeight / rowHeight) + offscreenRows * 2;

        return nextState;
    }

    onScroll(e)
    {
        setTimeout(() => this.setState(this.computeScrollState()), 100);
    }

    componentDidUpdate()
    {
        if (this.wrapper.current && !this.state.scrollHeight) {
            this.setState(this.computeScrollState());
        }
    }

    render()
    {
        const id = this.props.match.params.id;
        return (
            <div className={"page patients" + (id ? "" : " active")}>
                <header className="app-header">
                    <h1>Population Cardiac Risk</h1>
                </header>
                { this.renderHeader() }
                { this.renderList() }
                <Footer />
            </div>
        )
    }

    renderList()
    {
        const { rowHeight, skipTop, skipBottom } = this.state;
        const { loading, error, data } = this.props;

        if (!data || !data.length) {
            return loading ?
                <div className="patient-list has-message"><Loader/> Loading...</div> :
                <div className="patient-list has-message">No data available</div>;
        }
      
        if (error) {
            return <div className="patient-list has-message">{ String(this.props.error) }</div>
        }
    
        return (
            <div className="patient-list" onScroll={ this.onScroll } ref={ this.wrapper }>
                <div style={{ height: skipTop * rowHeight }} />
                { this.renderPatients() }
                <div style={{ height: skipBottom * rowHeight }} />
            </div>
        )
    }

    renderHeader() {
        return (
            <header className="patient-header">
                <div style={{ flex: "2 0 0" }}>
                    <input type="search" className="form-control" placeholder="Search patients" onInput={
                        e => this.props.dispatch(search(e.target.value.trim()))
                    } />
                </div>
                <div style={{ flex: "0 0 12.5em" }}>
                    Sort:&nbsp;
                    <select className="form-control" onChange={
                        e => this.props.dispatch(sort(e.target.value))
                    }>
                        <option value="">None</option>
                        <option value="name:desc">Name: A-Z</option>
                        <option value="name:asc">Name: Z-A</option>
                        <option value="age:desc">Age: old first</option>
                        <option value="age:asc">Age: young first</option>
                        <option value="gender:desc">Gender: M-F</option>
                        <option value="gender:asc">Gender: F-M</option>
                    </select>
                </div>
            </header>
        )
    }

    renderAvatar(patient) {
        return (
            <div className="avatar">
                { patient.name.match(/\b[A-Z]/g).join("") }
            </div>
        );
    }

    renderPatients()
    {    
        const { search, sort } = this.props;
        const { startIndex, skipTop, windowLength, skipBottom } = this.state;
        const selectedPatientId = this.props.match.params.id || "";
        const start = startIndex + skipTop;
        const end   = start + windowLength - skipBottom;

        let found = 0;

        // Start by applying the search (if any) because that would reduce the
        // size of the dataset
        let data = search ?
            this.props.data.filter((rec, i) => {

                // Do we need to continue searching?
                if (found >= end) {
                    return false;
                }

                if (rec.name.toLowerCase().indexOf(search.toLowerCase()) > -1) {
                    found += 1;
                    return true;
                }

                return false;
            }) :
            this.props.data;

        // Exit early if there is no search match
        if (search && !data.length) {
            return <div className="center">No records matching your search</div>
        }

        // Now sort the records if needed
        if (sort) {
            data = data.sort((a, b) => {
                switch(sort) {
                    case "name:desc":
                        return a.name.localeCompare(b.name);
                    case "name:asc":
                        return b.name.localeCompare(a.name);
                    case "age:desc":
                        return a.dob > b.dob ? 1 : a.dob < b.dob ? -1 : 0;
                    case "age:asc":
                        return a.dob > b.dob ? -1 : a.dob < b.dob ? 1 : 0;
                    case "gender:desc":
                        return a.gender > b.gender ? -1 : a.gender < b.gender ? 1 : 0;
                    case "gender:asc":
                        return a.gender > b.gender ? 1 : a.gender < b.gender ? -1 : 0;
                    default:
                        return 0;
                }
            });
        }

        let win = [];

        for (let i = start; i <= end; i++) {
            const rec = data[i];
            if (!rec) break;

            win.push(
                <Link
                    to={"/" + rec.id}
                    key={ rec.id }
                    className={ "patient" + (selectedPatientId === rec.id ? " selected" : "") }
                >
                    { this.renderAvatar(rec) }
                    <div>
                        <b dangerouslySetInnerHTML={{
                            __html: search ? highlight(rec.name, search) : rec.name
                        }}/>
                    </div>
                    <div className="text-muted">{ getAge(rec) } { rec.gender }</div>
                </Link>
            );
        }

        return win;
    }
}

const ConnectedList = connect(state => ({
    loading          : state.patients.loading,
    error            : state.patients.error,
    data             : state.patients.data,
    search           : state.patients.search,
    sort             : state.patients.sort
  }))(PatientList);

export default withRouter(ConnectedList);
