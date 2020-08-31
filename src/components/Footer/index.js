/// <reference path="../../../@types/index.d.ts"/>

import React              from "react"
import PropTypes          from "prop-types"
import { connect }        from "react-redux"
import { formatDuration } from "../../lib"
import { setAdapterId }   from "../../store/settings"
import config from "../../config"
import "./Footer.scss"



class Footer extends React.Component
{
    static propTypes = {
        patients: PropTypes.number,
        start   : PropTypes.number,
        end     : PropTypes.number,
        settings: PropTypes.object,
        setAdapterId: PropTypes.func
    };
    
    constructor(props)
    {
        super(props);

        this.state = {
            serverMenuOpen: false
        };

        this.onServerBtnFocus = this.onServerBtnFocus.bind(this);
        this.onServerBtnBlur  = this.onServerBtnBlur.bind(this);
    }

    onServerBtnFocus()
    {
        this.setState({ serverMenuOpen: true });
    }

    onServerBtnBlur()
    {
        this.setState({ serverMenuOpen: false });
    }

    render()
    {
        const { patients, patientsLoadEndTime, patientsLoadStartTime, start, end } = this.props;
        return (
            <div className="app-footer">
                &nbsp; Loaded { patients.toLocaleString() } patients in {
                    formatDuration(patientsLoadEndTime - patientsLoadStartTime)
                }
                {
                    (start || start === 0) && (end || end === 0) ?
                        ` [${start} - ${end}]` :
                        null
                }
                <div style={{ flex: 1 }}></div>
                <div className={ "btn-group dropup" + (this.state.serverMenuOpen ? " open" : "") }>
                    <button className="btn btn-default btn-xs dropdown-toggle pull-right" style={{ margin: 5 }}
                        onFocus={ this.onServerBtnFocus }
                        onBlur={ this.onServerBtnBlur }
                    >
                        <i className="glyphicon glyphicon-globe"/>
                    </button>
                    <ul className="dropdown-menu">
                        { Object.keys(config.adapters).map(id => (
                            <li key={ id } onMouseDown={() => this.props.setAdapterId(id) }>
                                <a href={ "#" + id }>
                                { id === this.props.settings.adapter.id ?
                                    <i className="glyphicon glyphicon-check"/> :
                                    <i className="glyphicon glyphicon-unchecked"/>
                                }
                                &nbsp;{ config.adapters[id].label }
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        )
    }
}

const ConnectedFooter = connect(state => ({
    patients             : state.patients.data.length,
    patientsLoadStartTime: state.patients.patientsLoadStartTime, 
    patientsLoadEndTime  : state.patients.patientsLoadEndTime,
    settings             : state.settings
}), dispatch => ({
    // @ts-ignore
    setAdapterId: id => dispatch(setAdapterId(id))
}))(Footer);

export default ConnectedFooter;
