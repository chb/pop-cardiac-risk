import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as lib from "../lib"
import moment from "moment";
import { selectPatientId } from "../store/patients"

function avg(records) {
    const result = records.reduce((prev, cur) => prev + cur.value, 0) / records.length;
    if (isNaN(result)) return null;
    return lib.roundToPrecision(result, 2);
}

function last(records) {
    const val = lib.last(records);
    return val === undefined ?
        null :
        lib.roundToPrecision(val, 2);
}

class Grid extends React.Component
{
  static propTypes = {
    error: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Error)
    ]),
    loading: PropTypes.bool,
    data: PropTypes.arrayOf(PropTypes.object)
  };

  constructor(props) {
      super(props);
      this.state = {
          selectedId: null
      };
  }


  renderHeader()
  {
    return (
      <thead>
        <tr>
          {/* <th rowSpan="2">ID</th> */}
          <th rowSpan="2">Name</th>
          <th rowSpan="2">Gender</th>
          <th rowSpan="2">DOB</th>
          <th rowSpan="2">Age</th>
          
          <th colSpan="2">hscrp</th>

          <th colSpan="2">cholesterol</th>

          <th rowSpan="2">Smoker</th>

          <th colSpan="2">HDL</th>

          <th colSpan="2">sbp</th>

          <th colSpan="2">Risk Score</th>
        </tr>
        <tr>
            <th>latest</th>
            <th>average</th>

            <th>latest</th>
            <th>average</th>

            <th>latest</th>
            <th>average</th>

            <th>latest</th>
            <th>average</th>

            <th>latest</th>
            <th>average</th>
        </tr>
      </thead>
    )
  }

  renderEmptyBody(contents)
  {
    return (
      <tbody>
        <tr>
          <td className="empty-body" colSpan="15">{contents}</td>
        </tr>
      </tbody>
    )
  }

  renderBody()
  {
    if (this.props.loading) {
      return this.renderEmptyBody("Loading...")
    }

    if (this.props.error) {
        return this.renderEmptyBody(String(this.props.error));
    }

    if (!this.props.data || !this.props.data.length) {
      return this.renderEmptyBody("No data available")
    }

    return (
      <tbody>
        { this.props.data.map(this.renderRow, this) }
      </tbody>
    )
  }

  renderRow(rec, i) {
      const { observations_loading, selectedPatientId } = this.props;

    //   if (rec.deceasedBoolean || rec.deceasedDateTime) return null

    //   if (rec.score && rec.score.last === "N/A") return null;

    return (
        <tr
            key={i}
            className={ selectedPatientId === rec.id ? "selected" : null }
            onClick={() => this.props.dispatch(selectPatientId(rec.id))}
            style={{
            background: rec.score && rec.score.last !== "N/A" ?
                rec.score.last >= 20 ?
                    "#FDD" :
                    rec.score.last > rec.score.avg ?
                        "#FE9" :
                        "#DFE" :
                "#FFF"
          }}>
          {/* <td className="text-left">{ rec.id || "-" }</td> */}
          
          <td className="text-left">{ lib.getPatientDisplayName(JSON.parse(rec.name || "{}")) }</td>
          
          <td>{ rec.gender || "-" }</td>
          
          <td>{ rec.dob ? moment(rec.dob).format("YYYY-MM-DD") : "-" }</td>
          
          <td>{ rec.deceasedBoolean || rec.deceasedDateTime ? "dead" : rec.age }</td>

          <td>{ observations_loading ? "..." : !rec.hsCRP ? null : last(rec.hsCRP) }</td>
          <td>{ observations_loading ? "..." : !rec.hsCRP ? null : avg(rec.hsCRP ) }</td>

          <td>{ observations_loading ? "..." : !rec.cholesterol ? null : last(rec.cholesterol) }</td>
          <td>{ observations_loading ? "..." : !rec.cholesterol ? null : avg(rec.cholesterol ) }</td>

          <td>{ observations_loading ? "..." : rec.smoker ? lib.isSmoker(rec.smoker) ? <b style={{ color: "red" }}>Y</b> : "N" : null }</td>

          <td>{ observations_loading ? "..." : !rec.HDL ? null : last(rec.HDL) }</td>
          <td>{ observations_loading ? "..." : !rec.HDL ? null : avg(rec.HDL ) }</td>

          <td>{ observations_loading ? "..." : !rec.sbp ? null : last(rec.sbp) }</td>
          <td>{ observations_loading ? "..." : !rec.sbp ? null : avg(rec.sbp ) }</td>

          <td>{ observations_loading ? "..." : rec.score ? String(rec.score.last) : null }</td>
          <td>{ observations_loading ? "..." : rec.score ? String(rec.score.avg )  : null }</td>
        </tr>
    )
  }

  render()
  {
    return (
      <table className="grid">
          <colgroup style={{ background: "#EEE" }}>
            <col/>
            <col style={{ width: "15em" }}/>
            <col/>
            <col/>
            <col/>
          </colgroup>
          <colgroup>
            <col/>
            <col/>
            <col/>
            <col/>
            <col/>
            <col/>
            <col/>
          </colgroup>
          <colgroup style={{ background: "#FFE" }}>
            <col/>
            <col/>
          </colgroup>
        { this.renderHeader() }
        { this.renderBody() }
      </table>
    )
  }
}

const ConnectedGrid = connect(state => ({
    loading             : state.patients.loading,
    error               : state.patients.error,
    data                : state.patients.data,
    observations_loading: state.patients.observations_loading,
    observations_error  : state.patients.observations_error,
    selectedPatientId   : state.patients.selectedPatientId
}))(Grid);

export default ConnectedGrid;