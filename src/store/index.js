import {
    createStore,
    combineReducers,
    applyMiddleware
} from "redux";
import thunk from "redux-thunk";

import patientsReducer  from "./patients"
import selectedPatient  from "./selectedPatient"
import groups           from "./groups"
import settings         from "./settings"
import smart            from "./smart"

const store = createStore(
    combineReducers({
        patients    : patientsReducer,
        selectedPatient,
        groups,
        settings,
        smart
    }),
    applyMiddleware(thunk)
);

export default store;
