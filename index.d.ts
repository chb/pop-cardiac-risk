export * from "react-redux"

declare module "react-redux" {

    
    interface PatientsState {
        loading              : boolean;
        error                : Error | null;
        selectedPatientId    : string | null;
        patientsLoadStartTime: Date;
        patientsLoadEndTime  : Date;
        search               : string;
        sort                 : string;
        data                 : any[];
        idIndex              : {
            [id: string]: any;
        };
        observations_loading : boolean;
        observations_error   : Error | null;
    }

    interface AuthState {
        currentUser: any;
    }


    interface DefaultRootState {
        patients: PatientsState;
        auth: AuthState;
    }


}

