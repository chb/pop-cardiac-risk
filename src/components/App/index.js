import React            from "react";
import { Provider }     from "react-redux";
import config           from "../../config";
import store            from "../../store/";
import { loadPatients } from "../../store/patients";
import PatientList      from "../../components/PatientList/";
import Detail           from "../../components/DetailView/";
import ClientContext    from "../../ClientContext";
import GroupView        from "../../components/GroupView";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.scss';



class App extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      authorized: false,
      authError: null
    };
  }

  componentDidMount() {
    // @ts-ignore
    window.FHIR.oauth2.init(config.fhir)
      .then(client => {
        this.client = client;
        // @ts-ignore
        window.SMARTClient = client;
        this.setState({
          authorized: true,
          authError: null
        }, () => {
          store.dispatch(loadPatients(client));
        });
      })
      .catch(error => {
        this.setState({
          authorized: false,
          authError: error
        })
      })
      .finally(() => {
        setTimeout(() => document.body.classList.add("loaded"), 1000);
      })
  }

  render() {
    if (this.state.authError) {
      return String(this.state.authError);
    }

    if (!this.state.authorized) {
      return "Authorizing...";
    }

    return (
      <Router>
        <Provider store={store}>
          <div className="app">
            <ClientContext.Provider value={this.client}>
              <Switch>
                <Route path="/groups/:groupBy/:groupID">
                    <PatientList />
                    <GroupView/>
                </Route>
                <Route path="/:id?">
                  <PatientList />
                  <Detail />
                </Route>
              </Switch>
            </ClientContext.Provider>
          </div>
        </Provider>
      </Router>
    );
  }
}

export default App;
