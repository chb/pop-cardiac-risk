import {
    createStore,
    combineReducers,
    applyMiddleware
} from "redux";
import thunk from "redux-thunk";

import patientsReducer  from "./patients"
import selectedPatient  from "./selectedPatient"
import HDL              from "./HDL"
import sbp              from "./sbp"
import hsCRP            from "./hsCRP"
import totalCholesterol from "./totalCholesterol"

const store = createStore(
    combineReducers({
        patients    : patientsReducer,
        selectedPatient,
        totalCholesterol,
        hsCRP,
        HDL,
        sbp
    }),
    applyMiddleware(thunk)
);

export default store;
