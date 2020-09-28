import React               from "react";
import PropTypes           from "prop-types";
import { connect }         from "react-redux";
import moment              from "moment";
import * as lib            from "../lib";
import { selectPatientId } from "../store/patients";


class Grid extends React.Component {
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


  renderHeader() {
    return (
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Gender</th>
          <th>DOB</th>
          <th>Age</th>
        </tr>
      </thead>
    )
  }

  renderEmptyBody(contents) {
    return (
      <tbody>
        <tr>
          <td className="empty-body" colSpan={5}>{contents}</td>
        </tr>
      </tbody>
    )
  }

  renderBody() {
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
        {this.props.data.map(this.renderRow, this)}
      </tbody>
    )
  }

  renderRow(rec, i) {
    const { selectedPatientId } = this.props;

    return (
      <tr
        key={i}
        className={selectedPatientId === rec.id ? "selected" : null}
        onClick={() => this.props.dispatch(selectPatientId(rec.id))}
      >
        <td className="text-left">{rec.id || "-"}</td>
        <td className="text-left">{lib.getPatientDisplayName(JSON.parse(rec.name || "{}"))}</td>
        <td>{rec.gender || "-"}</td>
        <td>{rec.dob ? moment(rec.dob).format("YYYY-MM-DD") : "-"}</td>
        <td>{rec.deceasedBoolean || rec.deceasedDateTime ? "dead" : rec.age}</td>
      </tr>
    )
  }

  render() {
    return (
      <table className="grid">
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        {this.renderHeader()}
        {this.renderBody()}
      </table>
    )
  }
}

const ConnectedGrid = connect(state => ({
  loading: state.patients.loading,
  error: state.patients.error,
  data: state.patients.data,
  selectedPatientId: state.patients.selectedPatientId
}))(Grid);

export default ConnectedGrid;
