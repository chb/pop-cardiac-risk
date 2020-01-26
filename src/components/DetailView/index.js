import React from "react"
// import PropTypes from "prop-types";
import { connect } from "react-redux";
// import * as lib from "../../lib"
import moment from "moment";
import Chart from "../Chart";
import { Link, withRouter } from "react-router-dom";
import Loader from "../Loader"
// import { selectPatientId } from "../store/patients"
import "./DetailView.scss"
import { getAge } from "../../lib";

// const SMOKING_STATUS = { 
//     "449868002"      : { smoker: true , text: "Current every day smoker"       },
//     "428041000124106": { smoker: true , text: "Current some day smoker"        },
//     "8517006"        : { smoker: false, text: "Former smoker"                  },
//     "266919005"      : { smoker: false, text: "Never smoker"                   },
//     "77176002"       : { smoker: true , text: "Smoker, current status unknown" },
//     "266927001"      : { smoker: false, text: "Unknown if ever smoked"         },
//     "428071000124103": { smoker: true , text: "Current Heavy tobacco smoker"   },
//     "428061000124105": { smoker: true , text: "Current Light tobacco smoker"   }
// }

// function getSmokingStatus(code) {
//     const entry = SMOKING_STATUS[code];
//     if (entry) {
//         return (entry.smoker ? "Yes" : "No") + " (" + entry.text + ")";
//     }
//     return "Unknown if ever smoked";
// }


class Detail extends React.Component
{
    renderHDLChart() {
        return (
            <>
                <Chart id="chart-HDL" chartOptions={{
                    title: {
                        text: "HDL"
                    },
                    series: [
                        {
                            name: 'HDL',
                            data: this.props.HDL.map(rec => ({
                                y: rec.value,
                                x: +moment(rec.date)
                            }))
                        }
                    ]
                }}
                />
                <Chart id="chart-sbp" chartOptions={{
                    title: {
                        text: "Systolic Blood Pressure"
                    },
                    series: [
                        {
                            name: 'Systolic Blood Pressure',
                            data: this.props.sbp.map(rec => ({
                                y: rec.value,
                                x: +moment(rec.date)
                            }))
                        }
                    ]
                }}
                />
                <Chart id="chart-cholesterol" chartOptions={{
                    title: {
                        text: "Total Cholesterol"
                    },
                    series: [
                        {
                            name: 'Total Cholesterol',
                            data: this.props.cholesterol.map(rec => ({
                                y: rec.value,
                                x: +moment(rec.date)
                            }))
                        }
                    ]
                }}
                />
                <Chart id="chart-hsCRP" chartOptions={{
                    title: {
                        text: "High Sensitivity C-Reactive Protein (hsCRP)"
                    },
                    series: [
                        {
                            name: 'hsCRP',
                            data: this.props.hsCRP.map(rec => ({
                                y: rec.value,
                                x: +moment(rec.date)
                            }))
                        }
                    ]
                }}
                />
            </>
        );
    }

    renderHeader(patient) {
        if (!patient) {
            if (this.props.match.params.id) {
                return (
                    <header className="app-header">
                        <Link to="/" className="back-link">
                            <b className="glyphicon glyphicon-chevron-left"/>&nbsp;Back
                        </Link>
                    </header>
                )
            }
            return <header className="app-header"/>
        }

        return (
            <header className="app-header">
                <Link to="/" className="back-link">
                    <b className="glyphicon glyphicon-chevron-left"/>&nbsp;Back
                </Link>
                <b>{ patient.name }</b>
            </header>
        )
    }

    renderBody(patient) {
        if (!this.props.match.params.id) {
            return (
                <div className="center">
                    To view a cardiac risk score report
                    <h1>please select a patient</h1>
                </div>
            )
        }

        if (this.props.patients.loading) {
            return (
                <div className="center">
                    <h1><Loader/> Loading...</h1>
                </div>
            )
        }

        if (!patient) {
            return (
                <div className="center">
                    <h3 className="text-danger">Patient not found!</h3>
                    <h3 className="text-muted">Please select another patient</h3>
                </div>
            )
        }

        const { name, dob, gender } = patient;
        return (
            <div className="container-fluid">
                <br />
                <div className="jumbotron">
                    <table className="table">
                        <tbody>
                            <tr>
                                <th className="text-right">Name</th>
                                <td>{ name }</td>
                            </tr>
                            <tr>
                                <th className="text-right">DOB</th>
                                <td>{ moment(dob).format("YYYY-MM-DD") }</td>
                            </tr>
                            <tr>
                                <th className="text-right">Gender</th>
                                <td>{ gender }</td>
                            </tr>
                            <tr>
                                <th className="text-right">Age</th>
                                <td>{ getAge(patient) }</td>
                            </tr>
                            <tr>
                                <th className="text-right">ID</th>
                                <td>{ patient.id }</td>
                            </tr>
                        </tbody>
                    </table>
                    {/* <b>Smoker</b>: { getSmokingStatus(lib.last(smoker)) } &nbsp;&nbsp; */}
                    {/* <b>Risk Score</b>: { score ? <b>{`${score.last}% (${score.avg}% average)`}</b> : "N/A" } */}
                </div>
            </div>
        );
    }

    render() {
        // console.log(this.props);

        const { id } = this.props.match.params;
        const patient = id ?
            this.props.patients.data.find(p => p.id === id) :
            null

        // const {
        //     dob, gender, deceasedBoolean, deceasedDateTime,
        //     // smoker,
        //     name,
        //     // hsCRP,
        //     // cholesterol,
        //     // HDL,
        //     // sbp,
        //     // score
        // } = this.props;

        // // No patient selected
        // if (!id) return null;

        return (
            <div className={"page detail-view" + (id ? " active" : "")}>
                { this.renderHeader(patient) }
                { this.renderBody(patient) }
            </div>
        );
    }
}

const ConnectedDetail = connect(state => {
    return { patients: state.patients };
})(Detail);

export default withRouter(ConnectedDetail);