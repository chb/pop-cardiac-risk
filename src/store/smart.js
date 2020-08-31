// import {ThunkAction} from "redux-thunk";

const initialState = {
    authorized: true,
    error     : null,
    loading   : false
};

const SET_LOADING    = "auth/setLoading";
const SET_ERROR      = "auth/setError";
const SET_AUTHORIZED = "auth/setAuthorized";
const MERGE          = "auth/merge";

export function setLoading(bLoading) {
    return { type: SET_LOADING, payload: !!bLoading };
}

export function setAuthorized(bAuthorized) {
    return { type: SET_AUTHORIZED, payload: !!bAuthorized };
}

export function setError(error) {
    return { type: SET_ERROR, payload: error };
}

export function merge(payload) {
    return { type: MERGE, payload };
}

export function authorize() {
    return (dispatch, getState) => {
        const adapter = getState().settings.adapter;
        dispatch(merge({ loading: true, error: null, authorized: false }));
        // sessionStorage.clear();
        // @ts-ignore
        return window.FHIR.oauth2.init(adapter).then(
            client => {
                // @ts-ignore
                window.SMARTClient = client;
                dispatch(merge({ loading: false, authorized: true }));
            },
            error => {
                dispatch(merge({ loading: false, error }));
            }
        );
    };
}

export default function serversReducer(state = initialState, action)
{
    switch (action.type) {
        case MERGE:
            return { ...state, ...action.payload };
        case SET_LOADING:
            return { ...state, loading: action.payload };
        case SET_ERROR:
            return { ...state, error: action.payload };
        case SET_AUTHORIZED:
            return { ...state, authorized: action.payload };
        default:
            return state;
    }
}
