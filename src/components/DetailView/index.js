import React           from "react"
import PropTypes       from "prop-types"
import { connect }     from "react-redux"
import { withRouter }  from "react-router-dom";
import { merge, load } from "../../store/selectedPatient"
import CardiacRisk     from "../CardiacRisk"
import PageHeader      from "../PageHeader"
import "./DetailView.scss"


class DetailView extends React.Component
{
    static propTypes = {
        id  : PropTypes.string,
        load: PropTypes.func
    };

    shouldComponentUpdate(nextProps)
    {
        return nextProps.id || !(!!this.props.id && !nextProps.id)
    }

    componentDidMount()
    {
        const { id, load } = this.props;
        if (id) {
            load(id);
        }
    }

    componentDidUpdate(prevProps)
    {
        const { selectedPatient, id, loading, error, load } = this.props;
        
        if (!id) return;
        if (loading) return;
        if (error && prevProps.id === id) return;
        if (selectedPatient.id === id) return;

        load(id);
    }

    renderHeader()
    {
        const { id } = this.props;
        
        return (
            <PageHeader
                left="back"
                title="Risk Score"
                right={
                    id ?
                    <div className="col-3 btn-empty" onMouseDown={() => {
                        const { id, load } = this.props;
                        if (id) {
                            load(id);
                        }
                    }}>
                        <i className="glyphicon glyphicon-repeat"/>
                    </div> :
                    null
                }
            />
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
    render()
    {
        const { id } = this.props.match.params;
        return (
            <div className="page detail-view">
                <DetailView
                    { ...this.props }
                    id={ id }
                />
            </div>
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
        // @ts-ignore
        load              : id              => dispatch(load(id))
    })
)(Wrapper);

export default withRouter(DetailPage);
