import React       from "react";
import moment      from "moment";
import { connect } from "react-redux";
import * as lib    from "../lib";
import Chart       from "./Chart";

const SMOKING_STATUS = { 
    "449868002"      : { smoker: true , text: "Current every day smoker"       },
    "428041000124106": { smoker: true , text: "Current some day smoker"        },
    "8517006"        : { smoker: false, text: "Former smoker"                  },
    "266919005"      : { smoker: false, text: "Never smoker"                   },
    "77176002"       : { smoker: true , text: "Smoker, current status unknown" },
    "266927001"      : { smoker: false, text: "Unknown if ever smoked"         },
    "428071000124103": { smoker: true , text: "Current Heavy tobacco smoker"   },
    "428061000124105": { smoker: true , text: "Current Light tobacco smoker"   }
}

function getSmokingStatus(code) {
    const entry = SMOKING_STATUS[code];
    if (entry) {
        return (entry.smoker ? "Yes" : "No") + " (" + entry.text + ")";
    }
    return "Unknown if ever smoked";
}


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
    render() {
        const {
            id, dob, gender, deceasedBoolean, deceasedDateTime, smoker, name,
            HDL, score
        } = this.props;

        // No patient selected
        if (!id) return null;

        return (
            <div className="text-center">
                <br/>
                <div>
                    <b>Name</b>: {lib.getPatientDisplayName(JSON.parse(name || "{}"))} &nbsp;&nbsp;
                    <b>ID</b>: {id} &nbsp;&nbsp;
                    <b>DOB</b>: {moment(dob).format("YYYY-MM-DD")} &nbsp;&nbsp;
                    <b>Gender</b>: {gender} &nbsp;&nbsp;
                    <b>Age</b>: { deceasedBoolean || deceasedDateTime ? "deceased" : moment().diff(dob, "years") } &nbsp;&nbsp;
                    <b>Smoker</b>: { getSmokingStatus(lib.last(smoker)) } &nbsp;&nbsp;
                    <b>Risk Score</b>: { score ? <b>{`${score.last}% (${score.avg}% average)`}</b> : "N/A" }
                </div>
                { HDL.length && this.renderHDLChart() }
            </div>
        );
    }
}

const ConnectedDetail = connect(state => {
    const selectedId = state.patients.selectedPatientId;
    if (selectedId) {
        return state.patients.data.find(p => p.id === selectedId) || {};
    }
    return {};
})(Detail);

export default ConnectedDetail;
