import React          from "react";
import PropTypes      from "prop-types";
import { withRouter } from "react-router-dom";
import PageHeader     from "../PageHeader"

class GroupView extends React.Component
{
    static propTypes = {
        match: PropTypes.object.isRequired
    };

    render()
    {
        const { condition, groupBy } = this.props.match.params;

        let title = "No Title";
        
        if (groupBy === "gender") {
            title = "Patients by Gender";
            if (condition === "female") {
                title = "Female Patients";
            }
            else if (condition === "male") {
                title = "Male Patients";
            }
        }

        return (
            <div className="page active">
                <PageHeader
                    title={ title }
                    left="back"
                />
                <div className="page-contents">
                    <h4>Total Cholesterol in { title }</h4>
                    <h4>HDL in { title }</h4>
                    <h4>Systolic Blood Pressure in { title }</h4>
                </div>
            </div>
        );
    }
}

export default withRouter(GroupView);
