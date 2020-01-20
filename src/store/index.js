import {
    createStore,
    combineReducers,
    applyMiddleware
} from "redux";
import thunk from "redux-thunk";
import patientsReducer from "./patients"
import observationsReducer from "./observations"

const store = createStore(
    combineReducers({
        patients    : patientsReducer,
        observations: observationsReducer
    }),
    applyMiddleware(thunk)
);

export default store;
