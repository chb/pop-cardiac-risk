import {
    createStore,
    combineReducers,
    applyMiddleware
} from "redux";
import thunk from "redux-thunk";

import patientsReducer  from "./patients"
import selectedPatient  from "./selectedPatient"
import groups           from "./groups"

const store = createStore(
    combineReducers({
        patients    : patientsReducer,
        selectedPatient,
        groups
    }),
    applyMiddleware(thunk)
);

export default store;
