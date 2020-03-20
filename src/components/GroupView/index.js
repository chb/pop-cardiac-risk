import React          from "react";
import PropTypes      from "prop-types";
import { withRouter } from "react-router-dom";
import PageHeader     from "../PageHeader";
import config         from "../../config";

class GroupView extends React.Component
{
    static propTypes = {
        match: PropTypes.object.isRequired
    };

    onSubmit() {}

    render()
    {
        const { condition, groupBy } = this.props.match.params;

        let group = config.groups[groupBy][condition];
        let title = group.label + " patients";

        return (
            <div className="page active">
                <PageHeader
                    title={ title }
                    left="back"
                />
                <header className="text-center sub-header">
                    <div className="row" style={{ width: "100%" }}>
                        <div className="col-xs-6 text-center">
                            <div className="input-group" style={{ maxWidth: "100px", margin: "auto" }}>
                                <span className="input-group-addon"><b>From</b></span>
                                <input
                                    type="date"
                                    className="form-control"
                                    // min={ moment().subtract(10, "years").format(dateFormat) }
                                    // max={ moment(endDate).subtract(1, "day").format(dateFormat) }
                                    // value={ startDate.format(dateFormat) }
                                    // onChange={ e => this.setState({ startDate: moment(e.target.valueAsDate )}) }
                                />
                            </div>
                        </div>
                        <div className="col-xs-6 text-center" style={{ maxWidth: "100px", margin: "auto" }}>
                            <div className="input-group">
                                <span className="input-group-addon"><b>To</b></span>
                                <input
                                    type="date"
                                    className="form-control"
                                    // min={ moment(startDate).add(1, "day").format(dateFormat) }
                                    // max={ moment().format(dateFormat) }
                                    // value={ endDate.format(dateFormat) }
                                    // onChange={ e => this.setState({ endDate: moment(e.target.valueAsDate )}) }
                                />
                            </div>
                        </div>
                    </div>
                </header>
                <div className="page-contents">
                    <h4>Total cholesterol in { title }</h4>
                    <div style={{ lineHeight: "200px", textAlign: "center", border: "1px solid #DDD", margin: "0 0 2rem", background: "#EEE", color: "#999" }}>Chart</div>
                    <h4>HDL in { title }</h4>
                    <div style={{ lineHeight: "200px", textAlign: "center", border: "1px solid #DDD", margin: "0 0 2rem", background: "#EEE", color: "#999" }}>Chart</div>
                    <h4>Systolic blood pressure in { title }</h4>
                    <div style={{ lineHeight: "200px", textAlign: "center", border: "1px solid #DDD", margin: "0 0 2rem", background: "#EEE", color: "#999" }}>Chart</div>
                </div>
            </div>
        );
    }
}

export default withRouter(GroupView);
