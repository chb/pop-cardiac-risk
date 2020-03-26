import React               from 'react'
import PropTypes           from "prop-types"
import { connect }         from "react-redux"
import Footer              from "../Footer/"
import Checkbox            from "../Checkbox/"
import { search as doSearch, sort as doSort } from "../../store/patients"
import { getAge, highlight, buildClassName, getQuery, setQuery } from '../../lib';
import { Link, withRouter } from "react-router-dom";
import PageHeader from "../PageHeader"
import config from "../../config"
import "./PatientList.scss"


class Avatar extends React.Component
{
    render()
    {
        return (
            <div className="avatar">
                { this.props.patient.name.match(/\b[A-Z]/g).join("") }
            </div>
        );
    }
}

class Patient extends React.Component
{
    render()
    {
        const { patient, search = "", selected } = this.props;
        const { id, name, gender = "Unknown gender" } = patient;

        return (
            <Link
                to={"/" + id}
                className={ "patient" + (selected ? " selected" : "") }
            >
                <Avatar patient={ patient } />
                <div>
                    <b dangerouslySetInnerHTML={{
                        __html: search ? highlight(name, search) : name
                    }}/>
                </div>
                <div className="text-muted">
                    <b>{ getAge(patient, " old") }</b>, { gender || "Unknown gender" }
                </div>
            </Link>
        );
    }
}

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
            hideIncompatible: getQuery("all") !== "1",
            groupBy         : getQuery("group") || "none",
            openGroup       : getQuery("openGroup") || "",
            showFilters     : getQuery("cfg")
        };

        this.wrapper = React.createRef();

        this.onScroll = this.onScroll.bind(this);
        this.onSearch = this.onSearch.bind(this);
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

    // Event handlers ----------------------------------------------------------

    onSearch(e)
    {
        const q = e.target.value;
        if (q !== this.props.search) {
            this.props.dispatch(doSearch(q));
        }
    }

    onScroll()
    {
        this.setState(this.computeScrollState());
    }

    // Lifecycle ---------------------------------------------------------------

    componentDidUpdate(prevProps, prevState)
    {
        setQuery({
            cfg  : this.state.showFilters ? 1 : null,
            sort : this.props.sort,
            q    : this.props.search,
            group: this.state.groupBy === "none" ? null : this.state.groupBy,
            openGroup: this.state.openGroup || null,
            all: this.state.hideIncompatible ? null : 1
        });

        if (this.wrapper.current) {

            if (prevProps.search !== this.props.search || prevState.openGroup !== this.state.openGroup) {
                this.wrapper.current.scrollTop = 0;
                this.setState({
                    startIndex  : 0,
                    skipTop     : 0,
                    skipBottom  : 0,
                    scrollHeight: 0
                });
            }
            else if (!this.state.scrollHeight) {
                this.setState(this.computeScrollState());
            }
        }
    }

    componentDidMount()
    {
        if (this.wrapper.current && !this.state.scrollHeight) {
            this.setState(this.computeScrollState());
        }
    }

    // Data manipulation methods -----------------------------------------------

    sort(data)
    {
        const { sort } = this.props;
        
        if (!sort) {
            return data;
        }

        return data.sort((a, b) => {
            switch(sort) {
                case "name:desc":
                    return String(a.name || "").localeCompare(String(b.name || ""));
                case "name:asc":
                    return String(b.name || "").localeCompare(String(a.name || ""));
                case "age:desc":
                    return a.age - b.age;
                case "age:asc":
                    return b.age - a.age;
                case "gender:desc":
                    return a.gender > b.gender ? -1 : a.gender < b.gender ? 1 : 0;
                case "gender:asc":
                    return a.gender > b.gender ? 1 : a.gender < b.gender ? -1 : 0;
                default:
                    return 0;
            }
        });
    }

    filter()
    {
        const { hideIncompatible } = this.state;
        const search = String(this.props.search || "").trim();

        return [...this.props.data.filter(rec => {

            if (hideIncompatible) {

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

                // Hide patients younger than 20 years
                if (rec.age < 20) {
                    return false;
                }

                // Hide patients older than 79 years
                if (rec.age > 79) {
                    return false;
                }
            }

            // if (groupBy === "gender" && rec.gender !== openGroup) {
            //     return false;
            // }

            if (search && rec.name.toLowerCase().indexOf(search.toLowerCase()) === -1) {
                return false;
            }

            return true;

        })];
    }

    // Rendering methods -------------------------------------------------------

    render()
    {
        const id = this.props.match.params.id;
        const { windowLength, topOffscreenRows } = this.state;
        const start = topOffscreenRows;
        const end   = start + windowLength - this.props.offscreenRows * 2

        return (
            <div className={"page patients" + (id ? "" : " active")}>
                <PageHeader title="Population Cardiac Risk"/>
                { this.renderHeader() }
                { this.renderPatients() }
                <Footer start={ start } end={ end } />
            </div>
        )
    }

    renderPatients()
    {
        const { loading, error, data } = this.props;

        if (!data.length) {
            return loading ?
                <div className="patient-list has-message"><i className="loader"/> Loading...</div> :
                <div className="patient-list has-message">No data available</div>;
        }
      
        if (error) {
            return <div className="patient-list has-message">{ String(this.props.error) }</div>
        }

        return this.renderList();
    }

    renderHeader()
    {
        const { sort, search } = this.props;
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
                        onChange={ this.onSearch }
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
                                onMouseDown={ () => this.props.dispatch(doSort(``)) }>
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

    renderByAge()
    {
        const {
            startIndex,
            skipTop,
            windowLength,
            skipBottom,
            rowHeight
        } = this.state;

        const { groupID } = this.props.match.params;

        const selectedPatientId = this.props.match.params.id || "";
        
        const start = startIndex + skipTop;
        
        let search = String(this.props.search || "").trim();

        let end   = start + windowLength - skipBottom;

        let data = this.filter();

        if (!data.length) {
            return <div className="center">No records found</div>
        }

        const groups = {};
        for (const key in config.groups.age) {
            groups[key] = {
                ...config.groups.age[key],
                id: key,
                data: [],
                length: 0
            };
        }

        function getGroup(pt) {
            for (const g in groups) {
                const group = groups[g];
                if (group.matches(pt)) {
                    return group;
                }
            }
            return groups.unknown;
        }

        for (const g in groups) {
            groups[g].length = data.reduce((prev, cur) => {
                return prev + (getGroup(cur) === groups[g] ? 1 : 0);
            }, 0)
        }

        const openGroup = groups[this.state.openGroup];

        data = data.filter(rec => openGroup && openGroup.matches(rec));

        data = this.sort(data);

        for (let i = start; i < end; i++) {
            const rec = data[i];
            if (!rec) break;

            const group = getGroup(rec);

            group.data.push(
                <Patient key={ rec.id } patient={ rec } selected={ selectedPatientId === rec.id } search={ search } />
            );
        }

        const groupNames = Object.keys(groups);

        return groupNames.filter(g => groups[g].length > 0).sort().map((groupName, i, all) => {
            const group = groups[groupName];
            return [
                <div className={ buildClassName({
                    "group-header": 1,
                    "open": openGroup === group
                })}
                key={ "header-" + groupName }
                onClick={() => this.setState({ openGroup: groupName }) }>
                    <Link
                        to={"/groups/age/" + groupName}
                        onClick={e => e.stopPropagation() }
                        className={ buildClassName({
                            "pull-right stat-btn": 1,
                            "active": groupID === groupName
                        })}
                    >
                        <i className="glyphicon glyphicon-signal"/>
                    </Link>
                    { group.label } <b className="badge">{ groups[groupName].length }</b>
                </div>,
                group.data.length ? 
                    <div key="wrapper" className="patient-list" onScroll={ this.onScroll } ref={ this.wrapper }>
                        <div className="spacer" style={{ height: skipTop * rowHeight }} />
                        { group.data }
                        <div className="spacer" style={{ height: skipBottom * rowHeight }} />
                    </div> : null
            ];
        });
    }

    renderByGender()
    {
        const {
            startIndex,
            skipTop,
            windowLength,
            skipBottom,
            rowHeight
        } = this.state;

        const { groupID } = this.props.match.params;

        const selectedPatientId = this.props.match.params.id || "";
        
        const start = startIndex + skipTop;
        
        let search = String(this.props.search || "").trim();

        let end   = start + windowLength - skipBottom;

        let data = this.filter();

        if (!data.length) {
            return <div className="center">No records found</div>
        }

        const groups = {};
        for (const key in config.groups.gender) {
            groups[key] = {
                ...config.groups.gender[key],
                id: key,
                data: [],
                length: 0
            };
        }
        for (const p of data) {
            for (const gId in groups) {
                const g = groups[gId];
                if (g.matches(p)) {
                    g.length += 1;
                    break;
                }
            }
        }

        const groupNames = Object.keys(groups);
        const openGroup  = groups[this.state.openGroup];

        data = data.filter(rec => openGroup && openGroup.matches(rec));

        data = this.sort(data);

        for (let i = start; i < end; i++) {
            const rec = data[i];
            if (!rec) break;

            // const gender = rec.gender;
            const groupName = groupNames.find(id => groups[id].matches(rec));
            if (groupName) {
                groups[groupName].data.push(
                    <Patient key={ rec.id } patient={ rec } selected={ selectedPatientId === rec.id } search={ search } />
                );
            }
            // console.log(group)
            // group.data.push(
            //     <Patient key={ rec.id } patient={ rec } selected={ selectedPatientId === rec.id } search={ search } />
            // );
        }

        

        return groupNames.filter(g => groups[g].length > 0).sort().map((groupName, i, all) => {
            const group = groups[groupName];
            return [
                <div className={ buildClassName({
                    "group-header": 1,
                    "open": openGroup === group
                })}
                key={ "header-" + groupName }
                onClick={() => this.setState({ openGroup: groupName }) }>
                    <Link
                        to={"/groups/gender/" + groupName}
                        onClick={e => e.stopPropagation() }
                        className={ buildClassName({
                            "pull-right stat-btn": 1,
                            "active": groupID === groupName
                        })}
                    >
                        <i className="glyphicon glyphicon-signal"/>
                    </Link>
                    { group.label } <b className="badge">{ groups[groupName].length }</b>
                </div>,
                group.data.length ? 
                    <div key="wrapper" className="patient-list" onScroll={ this.onScroll } ref={ this.wrapper }>
                        <div className="spacer" style={{ height: skipTop * rowHeight }} />
                        { group.data }
                        <div className="spacer" style={{ height: skipBottom * rowHeight }} />
                    </div> : null
            ];
        });
    }

    renderList()
    {
        const { startIndex, skipTop, windowLength, skipBottom, groupBy, rowHeight } = this.state;

        if (groupBy === "gender") {
            return this.renderByGender();
        }

        if (groupBy === "age") {
            return this.renderByAge();
        }

        const selectedPatientId = this.props.match.params.id || "";
        const start = startIndex + skipTop;
        let end   = start + windowLength - skipBottom;

        let search = String(this.props.search || "").trim();

        let data = this.filter();

        // Exit early if there is no search match
        if (!data.length) {
            return <div className="center">No records matching your search</div>
        }

        data = this.sort(data);
        
        let win = [
            <div key="spacer-top" className="spacer" style={{ height: skipTop * rowHeight }} />
        ];

        for (let i = start; i <= end; i++) {
            const rec = data[i];
            if (!rec) break;
            win.push(<Patient key={ rec.id } patient={ rec } selected={ selectedPatientId === rec.id } search={ search } />);
        }

        win.push(<div key="spacer-bottom" className="spacer" style={{ height: skipBottom * rowHeight }} />);

        return (
            <div className="patient-list" onScroll={ this.onScroll } ref={ this.wrapper }>
                { win }
            </div>
        );
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
