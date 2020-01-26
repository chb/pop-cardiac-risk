import React from 'react';
import { Provider }  from "react-redux";
import store from "./store"
import { loadPatients } from "./store/patients"
import PatientList from "./components/PatientList/"
import Detail from "./components/DetailView/"
import {
  BrowserRouter as Router,
  // Switch,
  Route
} from "react-router-dom";
import './App.css';


class App extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      authorized: false,
      authError: null
    };
  }

  componentDidMount() {
    window.FHIR.oauth2.ready()
      .then(client => {
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
          {/* <Switch> */}
            <Route path="/:id?">
              <PatientList />
            </Route>
            <Route path="/:id?">
              <Detail />
            </Route>
          {/* </Switch> */}
          </div>
        </Provider>
      </Router>
    );
  }
}

export default App;
