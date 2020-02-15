import React       from "react"
import PropTypes   from "prop-types"
import { connect } from "react-redux"
// import * as lib from "../../lib"
// import Chart from "../Chart";
import { Link, withRouter } from "react-router-dom";
// import { selectPatientId } from "../store/patients"
import "./DetailView.scss"
import { merge, load } from "../../store/selectedPatient"
// import ReactDOM from "react-dom";
import CardiacRisk from "../CardiacRisk"
import ClientContext from "../../ClientContext"

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


class DetailView extends React.Component
{
    static propTypes = {
        client: PropTypes.object,
        id    : PropTypes.string,
        load  : PropTypes.func
    };

    shouldComponentUpdate(nextProps)
    {
        // if (nextProps.loading)
        //     return false;
        return nextProps.id || !(!!this.props.id && !nextProps.id)
    }

    componentDidMount()
    {
        const { id, load, client } = this.props;
        if (id) {
            load(client, id);
        }
    }

    componentDidUpdate()
    {
        const { selectedPatient, id, loading, error, load, client } = this.props;
        if (id && !loading && /*!error &&*/ (!selectedPatient.id || selectedPatient.id !== id)) {
            load(client, id);
        }
    }

    renderHeader()
    {
        const { id } = this.props;
        
        return (
            <header className="app-header">
                <Link to="/" className="back-link col-1 btn-empty">
                    <b className="glyphicon glyphicon-chevron-left"/>&nbsp;Back
                </Link>
                <b className="col-2">Risk Score</b>
                { id ? <div className="col-3 btn-empty">Reset</div> : null }
            </header>
        )
    }

    renderBody()
    {
        const { id, error } = this.props;

        if (!id) {
            return (
                <div className="center">
                    To view a cardiac risk score report
                    <h1>please select a patient</h1>
                </div>
            )
        }

        if (error) {
            return (
                <div className="center">
                    <pre>
                        { String(error) }
                    </pre>
                </div>
            )
        }

        if (this.props.loading) {
            return (
                <div className="center loading-screen active">
                    <h2><i className="loader"/> Loading...</h2>
                </div>
            )
        }

        return (
            <>
                <div className={"center loading-screen" + (this.props.loading ? " active" : "")}>
                    <h1><i className="loader"/> Loading...</h1>
                </div>
                <CardiacRisk
                    { ...this.props.selectedPatient }
                    dispatch={ this.props.dispatch }
                    setHDL={ this.props.setHDL }
                    setCholesterol={ this.props.setCholesterol }
                    setSBP={ this.props.setSBP }
                    setDiabetic={ this.props.setDiabetic }
                    setSmoker={ this.props.setSmoker }
                    setAfroAmerican={ this.props.setAfroAmerican }
                    setHypertensionTmt={ this.props.setHypertensionTmt }
                />
            </>
        );
    }

    render()
    {
        const { id } = this.props;

        document.title = id ? this.props.selectedPatient.name : "Patient List";

        return (
            <>
                { this.renderHeader() }
                { this.renderBody() }
            </>
        )
    }
}

class Wrapper extends React.Component
{
    // shouldComponentUpdate(nextProps)
    // {
    //     const oldId = this.props.match.params.id;
    //     const newId = nextProps.match.params.id;
    //     return !!newId || !(!!oldId && !newId)
    // }

    render()
    {
        const { id } = this.props.match.params;
        return (
            <ClientContext.Consumer>
                { client => (
                    <div className={"page detail-view" + (id ? " active" : "")}>
                        <DetailView
                            { ...this.props }
                            client={ client }
                            id={ id }
                        />
                    </div>
                )}
            </ClientContext.Consumer>
        );
    }
}

const DetailPage = connect(
    state => ({
        selectedPatient: state.selectedPatient.data,
        loading        : state.selectedPatient.loading,
        error          : state.selectedPatient.error
    }),
    dispatch => ({
        setHDL            : HDL             => dispatch(merge({ data: { HDL             }})),
        setCholesterol    : cholesterol     => dispatch(merge({ data: { cholesterol     }})),
        setSBP            : sbp             => dispatch(merge({ data: { sbp             }})),
        setDiabetic       : diabetic        => dispatch(merge({ data: { diabetic        }})),
        setAfroAmerican   : afroAmerican    => dispatch(merge({ data: { afroAmerican    }})),
        setSmoker         : smoker          => dispatch(merge({ data: { smoker          }})),
        setHypertensionTmt: hypertensionTmt => dispatch(merge({ data: { hypertensionTmt }})),
        load              : (client, id)    => dispatch(load(client, id))
    })
)(Wrapper);

export default withRouter(DetailPage);
