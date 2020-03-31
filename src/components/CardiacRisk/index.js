import React     from "react"
import PropTypes from "prop-types"
import moment    from "moment"
import Slider    from "../Slider/"
import Checkbox  from "../Checkbox/"
import { getAge, calcASCVD, buildClassName } from "../../lib";
import "./CardiacRisk.scss"


export default class CardiacRisk extends React.Component
{
    static propTypes = {

        /**
         * The display name of the patient as string
         */
        name: PropTypes.string,

        /**
         * The patient gender as string
         */
        gender: PropTypes.oneOf(["male", "female"]),

        /**
         * The patient DOB in format "YYY-MM-DD"
         */
        dob: PropTypes.string,

        /**
         * Systolic blood pressure in mm/Hg
         */
        sbp: PropTypes.number,

        /**
         * High Sensitivity C-Reactive Protein (hsCRP) in mg/dL
         */
        hsCRP: PropTypes.number,

        /**
         * family history of heart attack as boolean
         */
        hha: PropTypes.bool,

        /**
         * HDL in mm/Hg
         */
        HDL: PropTypes.number,

        /**
         * Current smoking status as boolean
         */
        smoker: PropTypes.bool,

        /**
         * Total cholesterol in mg/dL
         */
        cholesterol: PropTypes.number,

        /**
         * true, if the patient is deceased
         */
        deceasedBoolean: PropTypes.bool,

        /**
         * Date of death in format "YYY-MM-DD"
         */
        deceasedDateTime: PropTypes.string,

        /**
         * A function that will receive HDL value as number. If passed, the
         * HDL slider will be editable.
         */
        setHDL: PropTypes.func,

        /**
         * A function that will receive cholesterol value as number. If passed,
         * the "Total cholesterol" slider will be editable.
         */
        setCholesterol: PropTypes.func,

        /**
         * A function that will receive CRP value as number. If passed,
         * the "CRP" slider will be editable.
         */
        setCRP: PropTypes.func,

        /**
         * A function that will receive blood pressure value as number.
         * If passed, the "Systolic blood pressure" slider will be editable.
         */
        setSBP: PropTypes.func,

        /**
         * A function that will receive "family history of heart attack" value
         * as boolean. If passed, the "family history of heart attack" checkbox
         * will be editable. It will be read-only otherwise.
         */
        setHHA: PropTypes.func,

        /**
         * A function that will receive "current smoker" value as boolean.
         * If passed, the "current smoker" checkbox will be editable. It will
         * be read-only otherwise.
         */
        setSmoker: PropTypes.func,

        /**
         * Risk score below this number will be rendered as low risk (green)
         */
        lowScoreBoundary: PropTypes.number,

        /**
         * Risk score above this number will be rendered as high risk (red)
         */
        highScoreBoundary: PropTypes.number,

        /**
         * The rounding precision of the risk score:
         * - 0 for round number
         * - 1 for one digit after the decimal point
         * - 2 for two digits after the decimal point
         * and so on
         */
        precision: PropTypes.number
    };

    static defaultProps = {
        lowScoreBoundary : 10,
        highScoreBoundary: 20,
        precision: 1
    };

    render()
    {
        const {

            // patient demographics
            name,
            gender,
            dob,
            deceasedBoolean,
            deceasedDateTime,
            hypertensionTmt,

            // observations
            sbp,
            smoker,
            diabetic,
            cholesterol,
            HDL,

            // event handlers
            setHDL,
            setCholesterol,
            setSBP,
            setAfroAmerican,
            setDiabetic,
            setSmoker,
            setHypertensionTmt,

            // other
            afroAmerican,
            lowScoreBoundary,
            highScoreBoundary,
            precision

        } = this.props;

        const eol = deceasedDateTime ? moment(deceasedDateTime) : moment();
        const ageInYears = moment.duration(eol.diff(dob, "days"), "days").asYears();

        const ageAsString = getAge({
            dob,
            deceasedBoolean,
            deceasedDateTime
        }, " old");

        // console.log({
        //     gender: gender,
        //     age: ageInYears,
        //     sbp,
        //     africanAmerican: afroAmerican,
        //     totalCholesterol: cholesterol,
        //     hdl: HDL,
        //     smoker,
        //     hypertensionTreatment: hypertensionTmt,
        //     diabetes: diabetic
        // })

        const score = calcASCVD({
            gender: gender,
            age: ageInYears,
            sbp,
            africanAmerican: afroAmerican,
            totalCholesterol: cholesterol,
            hdl: HDL,
            smoker,
            hypertensionTreatment: hypertensionTmt,
            diabetes: diabetic
        }, precision, precision);
        
        return (
            <div className="cardiac-risk">
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">1</span>
                        About this test
                    </header>
                    <div className="text-muted">This report evaluates your potential risk of heart disease, heart attack, and stroke.</div>
                </div>
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">2</span>
                        Patient info &nbsp;&nbsp;&nbsp;
                        <span className="text-info" style={{ fontWeight: 400 }}>
                            <b>{ name }</b> - { ageAsString }, { gender || "Unknown gender" }
                        </span>
                    </header>
                    <div className="text-center">
                        <div className="checkbox-wrapper">
                            <Checkbox
                                checked={ smoker === true }
                                indeterminate={ smoker === undefined }
                                readOnly={ !setSmoker }
                                onChange={ setSmoker }
                                label="Current smoker?"
                            />
                        </div>
                        <div className="checkbox-wrapper">
                            <Checkbox
                                checked={ hypertensionTmt === true }
                                indeterminate={ hypertensionTmt === undefined }
                                readOnly={ !setHypertensionTmt }
                                onChange={ setHypertensionTmt }
                                label="Treatment for Hypertension?"
                            />
                        </div>
                        <div className="checkbox-wrapper">
                            <Checkbox
                                checked={ afroAmerican === true }
                                indeterminate={ afroAmerican === undefined }
                                readOnly={ !setAfroAmerican }
                                onChange={ setAfroAmerican }
                                label="African-American?"
                            />
                        </div>
                        <div className="checkbox-wrapper">
                            <Checkbox
                                checked={ diabetic === true }
                                indeterminate={ diabetic === undefined }
                                readOnly={ !setDiabetic }
                                onChange={ setDiabetic }
                                label="Diabetic?"
                            />
                        </div>
                    </div>
                </div>
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">3</span>
                        Your risk over 10 years:
                        <h1 className={buildClassName({
                            score: true,
                            "text-muted": isNaN(+score),
                            "text-warning": score && score > lowScoreBoundary,
                            "text-danger": score && score > highScoreBoundary
                        })}>
                            { isNaN(+score) ? "N/A" : score + "%" }
                        </h1>
                    </header>
                </div>
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">4</span>
                        Your Results
                    </header>
                    <Slider
                        label="Systolic blood pressure"
                        precision={0}
                        value={ sbp }
                        onChange={ setSBP }
                        zones={[
                            {
                                label: <><div>Low</div><div className="text-muted">80 - 100 mm/Hg</div></>,
                                color: "rgb(97, 175, 201)",
                                min: 80,
                                max: 100
                            },
                            {
                                label: <><div>Normal</div><div className="text-muted">100 - 140 mm/Hg</div></>,
                                color: "rgb(11, 157, 188)",
                                min: 100,
                                max: 140
                            },
                            {
                                label: <><div>High</div><div className="text-muted">140+ mm/Hg</div></>,
                                color: "rgb(0, 142, 176)",
                                min  : 140,
                                max  : 200 
                            }
                        ]}
                    />
                    <Slider
                        label="Total cholesterol level"
                        precision={1}
                        value={ cholesterol }
                        onChange={ setCholesterol }
                        zones={[
                            {
                                label: <><div>Desirable</div><div className="text-muted">130 - 200 mg/dL</div></>,
                                color: "rgb(160, 190, 120)",
                                min: 130,
                                max: 200
                            },
                            {
                                label: <><div>Borderline</div><div className="text-muted">200 - 240</div></>,
                                color: "rgb(134, 173, 82)",
                                min: 200,
                                max: 240
                            },
                            {
                                label: <><div>High</div><div className="text-muted">240 - 320</div></>,
                                color: "rgb(94, 137, 43)",
                                min: 240,
                                max: 320 
                            }
                        ]}
                    />
                    <div style={{ marginLeft: "4rem" }}>
                        <Slider
                            small
                            label='HDL "good" cholesterol'
                            value={ HDL }
                            precision={ 1 }
                            onChange={ setHDL }
                            zones={[
                                {
                                    label: <><div>High risk</div><div className="text-muted">20 mg/dL</div></>,
                                    color: "rgb(160, 190, 120)",
                                    min: 20,
                                    max: 40
                                },
                                {
                                    label: <><div>Intermediate</div><div className="text-muted">40 - 60</div></>,
                                    color: "rgb(134, 173, 82)",
                                    min: 40,
                                    max: 60
                                },
                                {
                                    label: <><div>Protective</div><div className="text-muted">60 - 100</div></>,
                                    color: "rgb(94, 137, 43)",
                                    min: 60,
                                    max: 100 
                                }
                            ]}
                        />
                    </div>
                </div>
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
                <div className="horizontal-section">
                    <header>
                        <span className="item-number">6</span>
                        Further reading
                    </header>
                    <ul className="small" style={{ margin: "0 0 1em 0", padding: "0 0 0 0.7em" }}>
                        <li><a rel="noopener noreferrer" target="_blank" href="https://informationisbeautiful.net/2010/visualizing-bloodtests/">Original Design: David McCandless & Stefanie Posavec for Wired Magazine</a></li>
                        <li><a rel="noopener noreferrer" target="_blank" href="https://professional.heart.org/professional/GuidelinesStatements/PreventionGuidelines/UCM_457698_ASCVD-Risk-Calculator.jsp">Based on the 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk</a></li>
                    </ul>
                </div>
            </div>
        );
    }
}
