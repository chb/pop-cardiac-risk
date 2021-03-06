import moment from "moment"
import {
    query,
    getPatientDisplayName,
    setQuery,
    getAdapter
} from "../lib"

const urlQuery = new URLSearchParams(window.location.search);

const initialState = {
    loading              : false,
    error                : null,
    selectedPatientId    : null,
    patientsLoadStartTime: Date.now(),
    patientsLoadEndTime  : Date.now(),
    search               : urlQuery.get("q"   ) || "",
    sort                 : urlQuery.get("sort") || "",
    data                 : [],
    idIndex              : {},
    observations_loading : false,
    observations_error   : null
};

const SET_LOADING  = "patients/setLoading";
const SET_ERROR    = "patients/setError";
const SET_PATIENTS = "patients/setPatients";
const ADD_PATIENTS = "patients/addPatients";
const MERGE        = "patients/merge";
const SELECT       = "patients/selectedPatientId";
const SEARCH       = "patients/search";
const SORT         = "patients/sort";

export function setLoading(bool) {
    return { type: SET_LOADING, payload: !!bool };
}

export function setError(error) {
    return { type: SET_ERROR, payload: error };
}

export function selectPatientId(id) {
    return { type: SELECT, payload: id };
}

export function setPatients(payload) {
    return { type: SET_PATIENTS, payload };
}

export function addPatients(payload) {
    return { type: ADD_PATIENTS, payload };
}

export function merge(payload) {
    return { type: MERGE, payload };
}

export function search(payload) {
    return { type: SEARCH, payload };
}

export function sort(payload) {
    return { type: SORT, payload };
}

export function loadPatients() {
    return function (dispatch, getState) {
        dispatch(merge({ loading: true, error: null }));
        const settings = getState().settings;
        const adapter = getAdapter(settings.adapter);
        // console.log("***", adapter, settings.adapter);
        return query({
            sql: adapter.loadPatients(),
            maxRows: 10000,
            onPage(data) {
                dispatch(addPatients(data.map(o => {
                    if (!o.dob) {
                        o.age = -1;
                    } else {
                        const eol = o.deceasedDateTime ?
                            moment(o.deceasedDateTime, "YYYY-MM-DDThh:mm:ssZZ") :
                            moment();
                        o.age = moment.duration(eol.diff(o.dob, "days"), "days").asYears();
                    }

                    o.name = getPatientDisplayName(JSON.parse(o.name || "{}"));
                    return o;
                })));
            }
        })
        .then(() => dispatch(merge({ error: null, loading: false })))
        .catch(error => dispatch(merge({ error, loading: false })));
    };
}

export default function serversReducer(state = initialState, action)
{
    switch (action.type) {

        case SET_LOADING:
            return { ...state, loading: !!action.payload };

        case SET_ERROR:
            return { ...state, error: action.payload };
        
        case SELECT:
            return { ...state, selectedPatientId: action.payload };
        
        case SET_PATIENTS: {
            const idIndex = {};
            action.payload.forEach((o, i) => {
                idIndex[o.id] = o;
            });
            return {
                ...state,
                loading: false,
                idIndex,
                data: [
                    ...action.payload
                ]
            };
        }

        case ADD_PATIENTS: {
            const idIndex = {};
            action.payload.forEach((o, i) => {
                idIndex[o.id] = o;
            });
            return {
                ...state,
                patientsLoadEndTime: Date.now(),
                data: [ ...state.data, ...action.payload ],
                idIndex: {
                    ...state.idIndex,
                    ...idIndex
                }
            };
        }
        
        case MERGE: {
            const data = [ ...state.data ];
            if (action.payload.data) {
                action.payload.data.forEach(item => {
                    const rec = data.find(o => o.id === item.id);
                    if (rec) {
                        Object.assign(rec, item);
                    } else {
                        data.push(item);
                    }
                });
            }

            return {
                ...state,
                ...action.payload,
                data
            };
        }

        case SEARCH:
            setQuery({ q: action.payload });
            return {
                ...state,
                search: action.payload
            };
        
        case SORT:
            setQuery({ sort: action.payload });
            return {
                ...state,
                sort: action.payload
            };

        default:
            return state;
    }
}

