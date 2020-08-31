const BACKEND_HOST = process.env.NODE_ENV === "development" ?
    "http://localhost:4000" :
    "https://smart-proxy-server.herokuapp.com"

export default {
    defaultAdapter: "mysql1", // MUST point to one of the adapters listed below!
    adapters : {
        mysql1: {
            label   : "MySQL STU3 Database",
            iss     : `${BACKEND_HOST}/service/mysql-gcp`,
            clientId: "whatever",
            scope   : "system/Patient.read system/Observation.read offline_access",
            type    : "mysql"
        },
        // mysql2: {
        //     label   : "MySQL STU3 Database (old)",
        //     iss     : `${BACKEND_HOST}/service/mysql-r3`,
        //     clientId: "whatever",
        //     scope   : "system/Patient.read system/Observation.read offline_access",
        //     type    : "mysql"
        // },
        // mysql3: {
        //     label   : "MySQL DSTU2 Database",
        //     iss     : `${BACKEND_HOST}/service/mysql-leap`,
        //     clientId: "whatever",
        //     scope   : "system/Patient.read system/Observation.read offline_access",
        //     type    : "mysql"
        // },
        presto: {
            label   : "Presto STU3 Database",
            iss     : `${BACKEND_HOST}/service/presto-leap-2`,
            clientId: "whatever",
            scope   : "system/Patient.read system/Observation.read offline_access",
            type    : "presto"
        }
    },
    groups: {
        "age" : {
            "unknown": {
                label  : "Unknown Age",
                matches: p => !p.age,
                minAge : 0,
                maxAge : 0
            },
            "0-to-1": {
                label  : "0 to 1 year old",
                matches: p => p.age > 0 && p.age <=1,
                minAge : 0,
                maxAge : 1
            },
            "1-to-20": {
                label  : "1 to 20 years old",
                matches: p => p.age > 1 && p.age <=20,
                minAge : 1,
                maxAge : 20
            },
            "20-to-40": {
                label  : "20 to 40 years old",
                matches: p => p.age > 20 && p.age <=40,
                minAge : 20,
                maxAge : 40
            },
            "40-to-80": {
                label  : "40 to 80 years old",
                matches: p => p.age > 40 && p.age <=80,
                minAge : 40,
                maxAge : 80
            },
            "80-and-up": {
                label  : "80+ years old",
                matches: p => p.age > 80,
                minAge : 80,
                maxAge : 140
            }
        },
        "gender": {
            "m": {
                label: "male",
                matches: p => p.gender === "male"
            },
            "f": {
                label: "female",
                matches: p => p.gender === "female"
            },
            "o": {
                label: "other/unknown gender",
                matches: p => p.gender !== "male" && p.gender !== "female"
            }
        }
    }
};
