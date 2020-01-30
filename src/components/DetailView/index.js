import React from "react"
// import PropTypes from "prop-types";
import { connect } from "react-redux";
// import * as lib from "../../lib"
// import moment from "moment";
// import Chart from "../Chart";
import { Link, withRouter } from "react-router-dom";
// import Loader from "../Loader"
// import { selectPatientId } from "../store/patients"
import "./DetailView.scss"
import { getAge, reynoldsRiskScore, buildClassName } from "../../lib";
import Slider from "../Slider/"
import { merge } from "../../store/selectedPatient"
// import ReactDOM from "react-dom";
import Checkbox from "../Checkbox/"

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
function HR() {
    return <div style={{
        borderTop: "1px dotted #999",
        margin: "10px 0"
    }} />
}


class Detail extends React.Component
{
    shouldComponentUpdate(nextProps)
    {
        return !!nextProps.match.params.id || document.body.clientWidth >= 1024;
    }

    renderHeader(patient) {
        if (!patient) {
            if (this.props.match.params.id) {
                return (
                    <header className="app-header">
                        <Link to="/" className="back-link col-1 btn-empty">
                            <b className="glyphicon glyphicon-chevron-left"/>&nbsp;Back
                        </Link>
                    </header>
                )
            }
            return <header className="app-header"/>
        }

        return (
            <header className="app-header">
                <Link to="/" className="back-link col-1 btn-empty">
                    <b className="glyphicon glyphicon-chevron-left"/>&nbsp;Back
                </Link>
                <b className="col-2">Risk Score</b>
                <div className="col-3 btn-empty">Reset</div>
            </header>
        )
    }

    renderBody(patient) {
        const { dispatch } = this.props;

        if (!this.props.match.params.id) {
            return (
                <div className="center">
                    To view a cardiac risk score report
                    <h1>please select a patient</h1>
                </div>
            )
        }

        // if (this.props.patients.loading) {
        //     return (
        //         <div className="center">
        //             <h1><Loader/> Loading...</h1>
        //         </div>
        //     )
        // }

        if (!patient) {
            return (
                <div className="center">
                    <h3 className="text-danger">Patient not found!</h3>
                    <h3 className="text-muted">Please select another patient</h3>
                </div>
            )
        }

        const { name, /*dob,*/ gender, sbp, hha, smoker } = patient;

        const score = reynoldsRiskScore(patient, 0, 0);
        // const optimalScore = reynoldsRiskScore({
        //     ...patient,
        //     smoker: false,
        //     hsCRP: 0.5,
        //     cholesterol: 160,
        //     HDL : 60,
        //     sbp: 120
        // });
        // const lowerSbpScore = sbp && sbp > 10 ? reynoldsRiskScore({
        //     ...patient,
        //     sbp: sbp - 10
        // }) : null;
        // const nonSmokerScore = score && smoker ? reynoldsRiskScore({
        //     ...patient,
        //     smoker: false
        // }) : null;

        return (
            <div className="container-fluid" style={{
                overflow: "auto",
                width: "100%",
                flex: "1 1 0",
                display: "flex",
                flexDirection: "column",
                paddingTop: "1rem"
            }}>
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">1</span>
                        About this test
                    </header>
                    <div className="text-muted">This report evaluates your potential risk of heart disease, heart attack, and stroke.</div>
                    <div className="text-warning">Note: these results are valid for non-diabetics only!</div>
                </div>
                <HR />
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">2</span>
                        Patient info &nbsp;&nbsp;&nbsp;
                        <span className="text-info" style={{ fontWeight: 400 }}>
                            <b>{ name }</b> - { getAge(patient, " old") } { gender }
                        </span>
                    </header>
                    <div className="text-center">
                        <div style={{
                            margin   : "10px auto 5px",
                            display  : "inline-block",
                            width    : "17em",
                            textAlign: "left"
                        }}>
                            <Checkbox
                                checked={ smoker === true }
                                indeterminate={ smoker === undefined }
                                onChange={ checked => dispatch(merge({ data: { smoker: checked }})) }
                                label="Current smoker?"
                            />
                        </div>
                        <div style={{
                            margin   : "10px auto",
                            display  : "inline-block",
                            width    : "17em",
                            textAlign: "left"
                        }}>
                            <Checkbox
                                checked={ hha === true }
                                indeterminate={ hha === undefined }
                                onChange={ checked => dispatch(merge({ data: { hha: checked }})) }
                                label="Family history of heart attack?"
                            />
                        </div>
                    </div>
                </div>
                <HR/>
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">3</span>
                        Your risk over 10 years:
                        <h1 className={buildClassName({
                            score: true,
                            "text-muted": score === null,
                            "text-warning": score && score > 10,
                            "text-danger": score && score > 20
                        })}>
                            { score === null ? "N/A" : score + "%" }
                        </h1>
                    </header>
                    
                    {/* <table>
                        <tbody>
                            <tr>
                                <td>
                                    <h1 className={buildClassName({
                                        score: true,
                                        "text-muted": score === null,
                                        "text-warning": score && score > 10,
                                        "text-danger": score && score > 20
                                    })}>
                                        { score === null ? "N/A" : score + "%" }
                                    </h1>
                                </td>
                                <td>
                                    <ul className="small">
                                        {
                                            optimalScore !== null && score && optimalScore < score ?
                                            <li>if { smoker ? "you didn't smoke and " : "" }all
                                            levels were optimal, your risk would be lowered
                                            to <b>{optimalScore}%</b></li> :
                                            null
                                        }
                                        {
                                            lowerSbpScore ?
                                            <li>if your blood pressure were {sbp - 10} mm/Hg,
                                            your risk would be lowered to <b>{lowerSbpScore}%</b></li> :
                                            null
                                        }
                                        {
                                            nonSmokerScore ?
                                            <li>if you didn't smoke, your risk would be lowered
                                            to <b>{nonSmokerScore}%</b></li> :
                                            null
                                        }
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table> */}
                    {/* <p className="text-muted">Use your test results to calculate your risk of a cardiovascular event at <a rel="noopener noreferrer" target="_blank" href="http://reynoldsriskscore.org/">ReynoldsRisk.org</a></p> */}
                </div>
                <HR />
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">4</span>
                        Your Results
                    </header>
                    <Slider
                        label="Systolic blood pressure"
                        precision={0}
                        value={ sbp }
                        onChange={ sbp => dispatch(merge({ data: { sbp }}))}
                        zones={[
                            {
                                label: <><div>Low</div><div className="text-muted">80 - 100 mm/Hg</div></>,
                                color: "rgb(208, 202, 120)",
                                min: 80,
                                max: 100
                            },
                            {
                                label: <><div>Normal</div><div className="text-muted">100 - 140 mm/Hg</div></>,
                                color: "rgb(191, 174, 84)",
                                min: 100,
                                max: 140
                            },
                            {
                                label: <><div>High</div><div className="text-muted">140+ mm/Hg</div></>,
                                color: "rgb(191, 139, 84)",
                                min  : 140,
                                max  : 160 
                            }
                        ]}
                    />
                    <Slider
                        label="CRP level test"
                        precision={1}
                        value={ patient.hsCRP }
                        onChange={ hsCRP => dispatch(merge({ data: { hsCRP }}))}
                        zones={[
                            {
                                label: <><div>Low risk</div><div className="text-muted">0 mg/dL</div></>,
                                color: "rgb(97, 175, 201)",
                                min: 0,
                                max: 1
                            },
                            {
                                label: <><div>Average</div><div className="text-muted">1 - 3</div></>,
                                color: "rgb(11, 157, 188)",
                                min: 1,
                                max: 3
                            },
                            {
                                label: <><div>High risk of cardiovascular disease</div><div className="text-muted">3 - 10</div></>,
                                color: "rgb(0, 142, 176)",
                                min: 3,
                                max: 10 
                            }
                        ]}
                    />
                    <Slider
                        label="Total cholesterol level"
                        precision={1}
                        value={ patient.cholesterol }
                        onChange={ cholesterol => dispatch(merge({ data: { cholesterol }}))}
                        zones={[
                            {
                                label: <><div>Desirable</div><div className="text-muted">0 mg/dL</div></>,
                                color: "rgb(160, 190, 120)",
                                min: 0,
                                max: 200
                            },
                            {
                                label: <><div>Borderline</div><div className="text-muted">200 - 239</div></>,
                                color: "rgb(134, 173, 82)",
                                min: 200,
                                max: 239
                            },
                            {
                                label: <><div>High</div><div className="text-muted">240+</div></>,
                                color: "rgb(94, 137, 43)",
                                min: 240,
                                max: 360 
                            }
                        ]}
                    />
                    <div style={{ marginLeft: "4rem" }}>
                        {/* <Slider
                            small
                            label='LDL "bad" cholesterol'
                            value={ patient.LDL }
                            precision={0}
                            onChange={ LDL => dispatch(merge({ data: { LDL }}))}
                            zones={[
                                {
                                    label: <><div>Optimal</div><div className="text-muted">0 mg/dL</div></>,
                                    color: "rgb(220, 230, 204)",
                                    min: 0,
                                    max: 100
                                },
                                {
                                    label: <><div>Near optimal</div><div className="text-muted">100 - 129</div></>,
                                    color: "rgb(189, 209, 160)",
                                    min: 100,
                                    max: 129
                                },
                                {
                                    label: <><div>Borderline high</div><div className="text-muted">129 - 159</div></>,
                                    color: "rgb(160, 190, 120)",
                                    min: 129,
                                    max: 159 
                                },
                                {
                                    label: <><div>High</div><div className="text-muted">160 - 189</div></>,
                                    color: "rgb(134, 173, 82)",
                                    min: 160,
                                    max: 189 
                                },
                                {
                                    label: <><div>Very High</div><div className="text-muted">190+</div></>,
                                    color: "rgb(94, 137, 43)",
                                    min: 190,
                                    max: 400 
                                }
                            ]}
                        /> */}
                        <Slider
                            small
                            label='HDL "good" cholesterol'
                            value={ patient.HDL }
                            precision={1}
                            onChange={ HDL => dispatch(merge({ data: { HDL }}))}
                            zones={[
                                {
                                    label: <><div>High risk</div><div className="text-muted">0 mg/dL</div></>,
                                    color: "rgb(160, 190, 120)",
                                    min: 0,
                                    max: 40
                                },
                                {
                                    label: <><div>Intermediate</div><div className="text-muted">40 - 59</div></>,
                                    color: "rgb(134, 173, 82)",
                                    min: 40,
                                    max: 59
                                },
                                {
                                    label: <><div>Protective</div><div className="text-muted">60+</div></>,
                                    color: "rgb(94, 137, 43)",
                                    min: 60,
                                    max: 100 
                                }
                            ]}
                        />
                    </div>
                </div>
                <HR />
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">5</span>
                        What now?
                    </header>
                    <div className="small what-now">
                        <div>
                            <div className="img hidden-xs">
                                <img src={ require("./runner.png")} alt="Runner" />
                            </div>
                            <div style={{ flex: 4 }}>
                                <b className="color-green">Diet and exercise</b>
                                <div className="text-muted">
                                    can improve your cholesterol levels
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="img hidden-xs">
                                <img src={ require("./smoker.png")} alt="Smoker" />
                            </div>
                            <div style={{ flex: 4 }}>
                                <b className="color-green">Staying smoke-free</b>
                                <div className="text-muted">
                                    is one of the best ways to improve your
                                    heart disease risk
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="img hidden-xs">
                                <img src={ require("./doctor.png")} alt="Doctor" />
                            </div>
                            <div style={{ flex: 4 }}>
                                <b className="color-green">Ask your doctor</b>
                                <div className="text-muted">
                                    about statins or other medications that can
                                    lower cholesterol
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div className="img hidden-xs">
                                <img src={ require("./needle.png")} alt="Needle" />
                            </div>
                            <div style={{ flex: 4 }}>
                                <b className="color-green">Consider retesting</b>
                                <div className="text-muted">
                                    in 1 or 2 weeks to exclude a temporary spike
                                    in blood levels
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <HR />
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">6</span>
                        Further reading
                    </header>
                    <ul className="small" style={{ margin: "0 0 1em 0", padding: "0 0 0 0.7em" }}>
                        <li><a rel="noopener noreferrer" target="_blank" href="https://informationisbeautiful.net/2010/visualizing-bloodtests/">Original Design: David McCandless & Stefanie Posavec for Wired Magazine</a></li>
                        <li><a rel="noopener noreferrer" target="_blank" href="http://reynoldsriskscore.org/">Reynolds Risk Score Calculator</a></li>
                        <li><a rel="noopener noreferrer" target="_blank" href="https://jamanetwork.com/journals/jama/fullarticle/205528">Development and validation of improved algorithms for the assessment of global cardiovascular risk in women:The Reynolds Risk Score. Ridker el al. JAMA 2007;297:611-619</a></li>
                        <li><a rel="noopener noreferrer" target="_blank" href="https://www.ahajournals.org/doi/full/10.1161/circulationaha.108.814251">C-reactive protein and parental history improve global cardiovascular risk prediction: The Reynolds Risk Score for Men. Ridker et al. Circulation. 2008;118:2243-2251</a></li>
                    </ul>
                </div>
                <br />
            </div>
        );
    }

    render() {
        // console.log(this.props);
        const patient = this.props.selectedPatient;
        // const { id } = this.props.match.params;
        // const patient = id ?
        //     this.props.patients.data.find(p => p.id === id) :
        //     null

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
            <>
                { this.renderHeader(patient) }
                { this.renderBody(patient) }
            </>
        );
    }
}

const wrapper = (props) => {
    const { id } = props.match.params;
    // const patient = id ?
    //     props.patients.data.find(p => p.id === id) :
    //     null;
    // document.title = patient ?
    //     patient.name :
    //         id ? "No Patient" : "Patient List";
    document.title = id ? props.selectedPatient.name : "Patient List";
    return (
        <div className={"page detail-view" + (id ? " active" : "")}>
            <Detail { ...props } />
        </div>
    );
}

const ConnectedDetail = connect(state => {
    return {
        // patients: state.patients,
        selectedPatient: state.selectedPatient.data,
    };
})(wrapper);

export default withRouter(ConnectedDetail);