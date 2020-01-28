import {
    createStore,
    combineReducers,
    applyMiddleware
} from "redux";
import thunk from "redux-thunk";
import patientsReducer from "./patients"
import selectedPatient from "./selectedPatient"

const store = createStore(
    combineReducers({
        patients    : patientsReducer,
        selectedPatient
    }),
    applyMiddleware(thunk)
);

export default store;
