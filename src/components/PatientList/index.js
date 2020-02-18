import React               from 'react'
import PropTypes           from "prop-types"
import { connect }         from "react-redux"
import Footer from "../Footer/"
import Checkbox from "../Checkbox/"
import { search as doSearch, sort as doSort } from "../../store/patients"
import { getAge, highlight, buildClassName } from '../../lib';
import { Link, withRouter } from "react-router-dom";
import "./PatientList.scss"
import moment from 'moment'


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
        offscreenRows: 20,
        data: []
    };

    constructor(props)
    {
        super(props);

        this.state = {
            startIndex      : 0,
            endIndex        : 15,
            skipTop         : 0,
            skipBottom      : 0,
            scrollHeight    : 0,
            windowLength    : 1,
            rowHeight       : 10,
            hideIncompatible: true,
            groupBy         : "none",
            openGroup       : "female",
            showFilters     : false
        };

        this.wrapper = React.createRef();

        this.onScroll = this.onScroll.bind(this);

        this.timer = null;
    }

    computeScrollState()
    {
        const { scrollHeight, clientHeight } = this.wrapper.current;
        const { offscreenRows } = this.props;
        let { rowHeight } = this.state;

        // scrollTop can be negative on touch devices
        const scrollTop = Math.max(this.wrapper.current.scrollTop, 0);
        
        const scrollBottom = scrollHeight - (clientHeight + scrollTop);
        const scrollBottomAbs = Math.max(scrollBottom, 0)
        // console.log(scrollBottom);

        const nextState = {
            // skipTop: 0,
            // skipBottom: 0,
            scrollHeight
        };

        // When called for the first time, measure the height of the first
        // (and only) child element and use that to set `rowHeight`
        if (this.state.windowLength === 1) {
            let firstResult = this.wrapper.current.querySelector(".patient");
            rowHeight = nextState.rowHeight = firstResult ? firstResult.offsetHeight : 70;
            // rowHeight = 70;
        }
        

        // const windowInnerLength = Math.ceil(clientHeight / rowHeight);

        nextState.windowLength = Math.ceil(clientHeight / rowHeight) + offscreenRows * 2;

        // find how many rows are off-screen above the top edge
        const topOffscreenRows = nextState.topOffscreenRows = Math.floor(scrollTop / rowHeight);

        // find how many rows are off-screen below the bottom edge
        const bottomOffscreenRows = Math.floor(scrollBottomAbs / rowHeight);

        if (scrollBottomAbs) {
        

            // If more than `offscreenRows` have become invisible, keep 
            // `offscreenRows` number of rows and replace the rest with an empty
            // div to free those DOM elements
            // if (topOffscreenRows >= offscreenRows) {
                // nextState.skipTop = topOffscreenRows - offscreenRows;
            // }
            // else if (topOffscreenRows > offscreenRows) {
            //     nextState.skipTop = 0;
            nextState.skipTop = Math.max(topOffscreenRows - offscreenRows, 0);
            // }
        }
        // else {
        //     nextState.skipTop = 0;
        // }

        

        if (scrollBottom > rowHeight) {

            

            // If more than `offscreenRows` have become invisible, keep 
            // `offscreenRows` number of rows and replace the rest with an empty
            // div to free those DOM elements
            // if (bottomOffscreenRows >= offscreenRows) {
            //     nextState.skipBottom = bottomOffscreenRows - offscreenRows;
            // }
            // else if (bottomOffscreenRows === offscreenRows) {
            //     nextState.skipBottom = 0;
            // }
            nextState.skipBottom = Math.max(bottomOffscreenRows - offscreenRows, 0);
        }
        // else {
        //     nextState.skipBottom = 0;
        // }
        

        return nextState;
    }

    onScroll(e)
    {
        // if (this.state.groupBy === "none") {
            // if (this.timer) {
            //     clearTimeout(this.timer);
            // }
            // this.timer = setTimeout(() => this.setState(this.computeScrollState()), 0);
            this.setState(this.computeScrollState())
        // }
    }

    componentDidUpdate(prevProps, prevState)
    {
        if (prevProps.search !== this.props.search || prevState.openGroup !== this.state.openGroup) {
            this.wrapper.current.scrollTop = 0;
            this.setState({
                startIndex  : 0,
                skipTop     : 0,
                skipBottom  : 0,
                scrollHeight: 0,
                // windowLength: 1
            });
        }
        else if (this.wrapper.current && !this.state.scrollHeight/* && this.state.groupBy === "none"*/) {
            this.setState(this.computeScrollState());
        }
    }

    componentDidMount()
    {
        if (this.wrapper.current && !this.state.scrollHeight) {
            this.setState(this.computeScrollState());
        }
    }


    // shouldComponentUpdate(nextProps, nextState)
    // {
    //     if (nextProps.data.length !== this.props.data.length) {
    //         return true;
    //     }
    // //     if (nextState.windowLength !== this.state.windowLength) {
    // //         return true;
    // //     }
    // //     if (nextState.skipBottom !== this.state.skipBottom) {
    // //         return true;
    // //     }
    // //     if (nextState.scrollHeight === this.state.scrollHeight) {
    // //         return false;
    // //     }
    //     if (
    //         // nextState.windowLength === this.state.windowLength &&
    //         nextState.skipTop === this.state.skipTop &&
    //         nextState.skipBottom === this.state.skipBottom //&&
    //         // nextState.scrollHeight === this.state.scrollHeight
    //     ) {
    //         return false;
    //     }
    //     return true;
    // }

    render()
    {
        const id = this.props.match.params.id;
        const { windowLength, topOffscreenRows } = this.state;
        const start = topOffscreenRows;
        const end   = start + windowLength - this.props.offscreenRows * 2

        return (
            <div className={"page patients" + (id ? "" : " active")}>
                <header className="app-header">
                    <h1>Population Cardiac Risk</h1>
                </header>
                { this.renderHeader() }
                { this.renderList() }
                <Footer start={ start } end={ end } />
            </div>
        )
    }

    renderList()
    {
        const { rowHeight, skipTop, skipBottom } = this.state;
        const { loading, error, data } = this.props;

        if (!data.length) {
            return loading ?
                <div className="patient-list has-message"><i className="loader"/> Loading...</div> :
                <div className="patient-list has-message">No data available</div>;
        }
      
        if (error) {
            return <div className="patient-list has-message">{ String(this.props.error) }</div>
        }
    
        return (
            <div className="patient-list" onScroll={ this.onScroll } ref={ this.wrapper }>
                {/* <div className="spacer" style={{ height: skipTop * rowHeight }} /> */}
                { this.renderPatients() }
                {/* <div className="spacer" style={{ height: skipBottom * rowHeight }} /> */}
            </div>
        )
    }

    renderHeader() {
        const { search, sort } = this.props;
        const [ sortBy, sortDir = "asc" ] = sort.split(":");
        const { groupBy, showFilters } = this.state;
        return (
            <header className={ buildClassName({
                "patient-header": 1,
                "show-filters": showFilters
            }) }>
                <div style={{ flex: "3 1 0" }} className={ buildClassName({
                    "search-input-wrap": true,
                    "has-search": search
                })}>
                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search patients"
                        value={search}
                        onChange={
                            e => this.props.dispatch(doSearch(e.target.value))
                        }
                    />
                    <span className="clear-search" title="Clear Search" onClick={
                        () => this.props.dispatch(doSearch(""))
                    }/>
                </div>
                <div style={{ flex: "0 0 1em" }} onMouseDown={() => this.setState({ showFilters: !showFilters })}>
                    <div className={ buildClassName({
                        btn: 1,
                        "btn-default active": showFilters
                    }) }>
                        <i className="glyphicon glyphicon-cog"/>
                    </div>
                </div>
                <div className="filters">
                    <div>
                        <Checkbox
                            checked={this.state.hideIncompatible}
                            onChange={on => this.setState({ hideIncompatible: on })}
                            label={
                                <>
                                    <b>Hide incompatible patients</b>
                                    <div className="small text-muted">
                                        Only show patients with known age and gender, who are
                                        not deceased and are between 20 and 79 years old.
                                    </div>
                                </>
                            }
                        />
                    </div>
                    <div>
                        <label>Group By</label>
                        <div className={ buildClassName({ "btn-group btn-group-justified": 1, "passive": groupBy === "none" }) }>
                            <label
                                className={ buildClassName({ "btn btn-default": 1, "active": groupBy === "none" }) }
                                onMouseDown={ () => this.setState({ groupBy: "none" }) }
                            >
                                None
                            </label>
                            <label
                                className={ buildClassName({ "btn btn-default": 1, "active": groupBy === "gender"}) }
                                onMouseDown={ () => this.setState({ groupBy: "gender" }) }>
                                Gender
                            </label>
                            <label
                                className={ buildClassName({ "btn btn-default": 1, "active": groupBy === "age" }) }
                                onMouseDown={ () => this.setState({ groupBy: "age" }) }>
                                Age
                            </label>
                        </div>
                    </div>
                    <div>
                        <label>Sort By</label>
                        <div className={ buildClassName({ "btn-group btn-group-justified": 1, "passive": !sortBy }) }>
                            <label
                                className={ buildClassName({ "btn btn-default": 1, "active": !sortBy }) }
                                onMouseDown={ () => this.props.dispatch(doSort(`:${sortDir}`)) }>
                                None
                            </label>
                            <label
                                className={ buildClassName({ "btn btn-default": 1, "active": sortBy === "name" }) }
                                onMouseDown={ () => this.props.dispatch(doSort(`name:${sortDir}`)) }>
                                Name
                            </label>
                            <label
                                className={ buildClassName({ "btn btn-default": 1, "active": sortBy === "gender" }) }
                                onMouseDown={ () => this.props.dispatch(doSort(`gender:${sortDir}`)) }>
                                Gender
                            </label>
                            <label
                                className={ buildClassName({ "btn btn-default": 1, "active" : sortBy === "age" }) }
                                onMouseDown={ () => this.props.dispatch(doSort(`age:${sortDir}`)) }>
                                Age
                            </label>
                        </div>
                    </div>
                    <div>
                        <label>Sort Direction</label>
                        <div className={ buildClassName({ "btn-group btn-group-justified": 1, "passive": !sortBy }) }>
                            <label
                                className={ buildClassName({ "btn btn-default": 1, "active" : sortDir === "asc"}) }
                                onMouseDown={ () => this.props.dispatch(doSort(`${sortBy}:asc`)) }>
                                <i className="glyphicon glyphicon-sort-by-attributes"/> Ascending
                            </label>
                            <label
                                className={ buildClassName({ "btn btn-default": 1, "active" : sortDir === "desc" }) }
                                onMouseDown={ () => this.props.dispatch(doSort(`${sortBy}:desc`)) }>
                                <i className="glyphicon glyphicon-sort-by-attributes-alt"/> Descending
                            </label>
                        </div>
                    </div>
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
        const { sort } = this.props;
        const { startIndex, skipTop, windowLength, skipBottom, hideIncompatible, groupBy, openGroup, rowHeight } = this.state;
        const selectedPatientId = this.props.match.params.id || "";
        const start = startIndex + skipTop;
        let end   = start + windowLength - skipBottom;
        const now = moment();

        let search = String(this.props.search || "").trim();

        let found = 0;

        let data = [ ...this.props.data ];

        // Start by applying the search (if any) because that would reduce the
        // size of the dataset
        if (search) {
            data = this.props.data.filter((rec, i) => {

                // Do we need to continue searching?
                if (found >= end) {
                    return false;
                }

                if (rec.name.toLowerCase().indexOf(search.toLowerCase()) > -1) {
                    found += 1;
                    return true;
                }

                return false;
            });
        }

        // Exit early if there is no search match
        if (search && !data.length) {
            return <div className="center">No records matching your search</div>
        }

        // Now sort the records if needed
        if (sort) {
            data.sort((a, b) => {
                switch(sort) {
                    case "name:desc":
                        return String(a.name || "").localeCompare(String(b.name || ""));
                    case "name:asc":
                        return String(b.name || "").localeCompare(String(a.name || ""));
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

        // hide incompatible patients
        if (hideIncompatible) {
            data = data.filter(rec => {

                // Hide patients with no gender
                if (!rec.gender) {
                    return false;
                }

                // Hide deceased patients
                if (rec.deceasedDateTime || rec.deceasedBoolean) {
                    return false;
                }

                // Hide patients with no birthDate
                if (!rec.dob) {
                    return false;
                }

                const ageInYears = moment.duration(now.diff(rec.dob, "days"), "days").asYears();

                // Hide patients younger than 20 years
                if (ageInYears < 20) {
                    return false;
                }

                // Hide patients older than 79 years
                if (ageInYears > 79) {
                    return false;
                }
                
                return true;
            });
        }

        // Group by gender
        if (groupBy === "gender") {
            const groups = {
                male  : {
                    data: [],
                    length: data.reduce((prev, cur) => prev + (cur.gender === "male" ? 1 : 0), 0)
                },
                female: {
                    data: [],
                    length: data.reduce((prev, cur) => prev + (cur.gender === "female" ? 1 : 0), 0)
                },
                "Unknown Gender": {
                    data: [],
                    length: data.reduce((prev, cur) => prev + (cur.gender !== "female" && cur.gender !== "male" ? 1 : 0), 0)
                }
            };
            for (let i = start; i < end; i++) {
                const rec = data[i];
                if (!rec) break;

                // if (sort.startsWith("name")) {
                //     console.log(rec.gender)
                // }

                const gender = String(rec.gender || "Unknown Gender");

                // if (groups[openGroup].length >= end) {
                //     break;
                // }

                // Create the group if needed
                // if (!groups[gender]) {
                //     groups[gender] = { data: [], length: 0 };
                // }

                // if (groups[rec.gender].length >= end) {
                //     continue;
                // }

                // if (groups[gender].data.length > windowLength) {
                //     break;
                // }
                

                if (openGroup === gender) {
                    
                    groups[gender].data.push(
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
                            <div className="text-muted"><b>{ getAge(rec, " old") }</b>, { gender }</div>
                        </Link>
                    );
                } else {
                    end++
                }

                // groups[gender].length += 1;
            }

            const groupNames = Object.keys(groups);

            // if (openGroup === "Unknown Gender" && sort.startsWith("name")) {
            //     console.log(groups)
            // }

            return groupNames.filter(g => groups[g].length > 0).sort().map((groupName, i, all) => {
                const group = groups[groupName].data;
                return [
                    <div className={ buildClassName({
                        "group-header": 1,
                        "open": openGroup === groupName
                    })}
                    key={ "header-" + groupName }
                    style={{
                        top: 35 * i,
                        bottom: 35 * (all.length - i - 1)
                    }}
                    onClick={() => this.setState({ openGroup: groupName }) }>
                        <i className="glyphicon glyphicon-signal pull-right"/>
                        { groupName } <b className="badge">{ groups[groupName].length }</b>
                    </div>,
                    group.length ? <div className="spacer" style={{ height: skipTop * rowHeight }} /> : null,
                    group,
                    group.length ? <div className="spacer" style={{ height: skipBottom * rowHeight }} /> : null
                ];
            });
        }

        // Group by gender
        else if (groupBy === "age") {
            
        } 

        let win = [
            <div className="spacer" style={{ height: skipTop * rowHeight }} />
        ];

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
                    <div className="text-muted"><b>{ getAge(rec, " old") }</b>, { rec.gender || "unknown gender" }</div>
                </Link>
            );
        }

        win.push(<div className="spacer" style={{ height: skipBottom * rowHeight }} />);

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
