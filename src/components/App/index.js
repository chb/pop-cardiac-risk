import React                 from "react";
import PropTypes             from "prop-types";
import { Provider, connect } from "react-redux";
import store                 from "../../store/";
import { loadPatients }      from "../../store/patients";
import { authorize }         from "../../store/smart";
import PatientList           from "../../components/PatientList/";
import Detail                from "../../components/DetailView/";
import GroupView             from "../../components/GroupView";
import Page                  from "../Page";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect
} from "react-router-dom";
import './App.scss';


class AppContainer extends React.Component {
    render() {
        return (
            <Router>
                <Provider store={store}>
                    <ConnectedApp />
                </Provider>
            </Router>
        );
    }
}

class App extends React.Component {
  
    static propTypes = {
        loading   : PropTypes.bool,
        authError : PropTypes.instanceOf(Error),
        authorized: PropTypes.bool,
        authorize : PropTypes.func
    };

    componentDidMount() {
        this.props.authorize().then(() => this.props.loadPatients());
        document.body.classList.add("loaded");
    }

    render() {
        const { loading, authError, authorized } = this.props;

        if (loading) {
          return (
              <div className="center loading-screen active">
                  <h2><i className="loader"/> Authorizing...</h2>
              </div>
          )
        }

        if (authError) {
          return (
              <div className="center">
                  <pre style={{ whiteSpace: "pre-wrap" }}>
                      { String(authError) }
                  </pre>
              </div>
          );
        }

        if (!authorized) {
            return <div className="center">Failed to authorize!</div>;
        }

        return (
            <div className="app">
                <PatientList />
                <Switch>
                    <Route path="/groups/:groupBy/:groupID">
                        <Page>
                            <GroupView/>
                        </Page>
                    </Route>
                    <Route path="/:id?" exact>
                        <Page>
                            <Detail />
                        </Page>
                    </Route>
                    <Route path="*">
                        <Redirect to="/" />
                    </Route>
                </Switch>
            </div>
        );
    }
}

const ConnectedApp = connect(state => ({
    authError : state.smart.error,
    authorized: state.smart.authorized,
    loading   : state.smart.loading
}), dispatch => ({
    // @ts-ignore
    authorize: () => dispatch(authorize()),
    // @ts-ignore
    loadPatients: () => dispatch(loadPatients())
}))(App);


export default AppContainer;
