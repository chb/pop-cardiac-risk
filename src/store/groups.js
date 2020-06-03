import { query, getPath, getQuery } from "../lib"
import config from "../config"

const initialState = {
    loading: false,
    error  : null,
    data   : {
        cholesterol : [],
        HDL         : [],
        sbp         : []
    }
};

const MERGE = "groups/merge";

export function merge(payload) {
    return { type: MERGE, payload };
}

/**
 * Load the observations for all the patients that match the currently selected
 * filters
 * @param {*} param0 
 */
export function loadAll({ startDate, endDate, minAge, maxAge, gender }) {
    return dispatch => {
        dispatch(merge({ loading: true, error: null, data: [] }));

        const data = {
            cholesterol : [],
            HDL         : [],
            sbp         : []
        };

        const sql = config.sqlAdapter.loadObservations({
            startDate,
            endDate,
            minAge,
            maxAge,
            gender,
            all: getQuery().all
        });

        return query({
            sql,
            onPage(payload) {
                payload.forEach(observation => {
                    switch (observation.code) {
    
                        // totalCholesterol
                        case "14647-2":
                        case "2093-3":
                            data.cholesterol.push({
                                value  : parseFloat(observation.observationValue),
                                date   : new Date(observation.effectiveDateTime),
                                patient: observation.patient.split("/").pop()
                            });
                        break;
    
                        // HDL
                        case "2085-9":
                            data.HDL.push({
                                value  : parseFloat(observation.observationValue),
                                date   : new Date(observation.effectiveDateTime),
                                patient: observation.patient.split("/").pop()
                            });
                        break;
    
                        // Systolic Blood Pressure from component
                        case "55284-4":
                            const component = JSON.parse(observation.component);
                            data.sbp.push({
                                value  : parseFloat(getPath(component, "0.valueQuantity.value")),
                                date   : new Date(observation.effectiveDateTime),
                                patient: observation.patient.split("/").pop()
                            });
                        break;
    
                        // This shouldn't happen
                        default:
                            console.warn(`Unknown observation type "${observation.code}"`);
                        break;
                    }
                });
            }
        })
        .then(() => dispatch(merge({ error: null, loading: false, data })))
        .catch(error => dispatch(merge({ error, loading: false })));
    };
}

export default function serversReducer(state = initialState, action)
{
    switch (action.type) {
        
        case MERGE:
            return { ...state, ...action.payload };

        default:
            return state;
    }
}

