import React from 'react';
import { Provider }  from "react-redux";
import store from "./store"
import { loadPatients } from "./store/patients"
import PatientList from "./components/PatientList/"
import Detail from "./components/DetailView/"
import ClientContext from "./ClientContext"
import PopulationView from "./components/PopulationView/"
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
    window.FHIR.oauth2.init({
      iss     : "https://smart-proxy-server.herokuapp.com/pop/presto1",
      // iss     : "http://localhost:4000/pop/presto1",
      clientId: "whatever",
      scope   : "system/Patient.read system/Observation.read offline_access"
    })
      .then(client => {
        this.client = client;
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
                <Route path="/groups/:id?">
                  <PopulationView />
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
