import React from 'react';
import { Provider }  from "react-redux";
import store from "./store"
import Grid from "./components/Grid"
import Detail from "./components/Detail"
import { loadPatients } from "./store/patients"
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
      <Provider store={store}>
        <div className="app">
          <header className="app-header">
            <h1>Population Cardiac Risk</h1>
          </header>
          <div className="grid-wrapper">
            <Grid />
          </div>
          <Detail/>
        </div>
      </Provider>
    );
  }
}

export default App;
