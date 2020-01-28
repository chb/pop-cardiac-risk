const initialState = {
    loading: false,
    error  : null,
    data: {
        id          : "patient-id",
        gender      : "male",
        dob         : "1939-08-30",
        age         : 80,
        deceasedBoolean : false,
        deceasedDateTime: false,
        name        : "John Doe",
        // hsCRP       : 2,
        // cholesterol : 100,
        // HDL         : 70,
        // LDL         : 80,
        // sbp         : 120,
        // smoker      : false,
        // hha         : false // Family history of heart attack
    }
};

const SET_LOADING  = "selectedPatient/setLoading";
const SET_ERROR    = "selectedPatient/setError";
const MERGE        = "selectedPatient/merge";

export function setLoading(bool) {
    return { type: SET_LOADING, payload: !!bool };
}

export function setError(error) {
    return { type: SET_ERROR, payload: error };
}

export function merge(payload) {
    return { type: MERGE, payload };
}

export default function reducer(state = initialState, action)
{
    switch (action.type) {

        case SET_LOADING:
            return { ...state, loading: !!action.payload };

        case SET_ERROR:
            return { ...state, error: action.payload };
        
        case MERGE:
            return {
                ...state,
                ...action.payload,
                data: {
                    ...state.data,
                    ...action.payload.data || {}
                }
            };

        default:
            return state;
    }
}

