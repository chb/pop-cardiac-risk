import * as MySQLAdapter from "./store/adapters/mysql"

export default {
    fhir: {
        // iss     : "https://smart-proxy-server.herokuapp.com/pop/presto1",
        // iss     : "https://smart-proxy-server.herokuapp.com/pop/mysql-leap",
        // iss     : "https://smart-proxy-server.herokuapp.com/service/mysql-r3",
        // iss     : "http://localhost:4000/service/mysql-r3",
        // iss     : "http://localhost:4000/pop/presto1",
        // iss     : "http://localhost:4000/pop/mysql-mina",
        // iss     : "http://localhost:4000/pop/mysql-leap",
        iss     : "http://localhost:4000/service/mysql-gcp",
        clientId: "whatever",
        scope   : "system/Patient.read system/Observation.read offline_access"
    },
    sqlAdapter: MySQLAdapter,
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
