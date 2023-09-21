# pop-cardiac-risk
## Population level cardiac-risk app

The main view is a patient browser and a cardiac risk calculator. This is designed to work with large volumes of data (tested with 2 million patients). The patients are listed in the sidebar and can be sorted, grouped and searched in real time. Incompatible patients that do not have enough information are filtered out by default but that can be turned off.
An ASCVD Risk Calculator for the selected patient is displayed on the right side. All of the input values are editable and the changes are applied in real time. This way the user can test how a change in blood pressure would affect the patient’s risk score for example. 

If the patients are grouped by age or gender in the sidebar, we see them rendered in groups. These groups are also cohorts that we can analyse. In the screenshot below we can see all the Cholesterol, HDL and SBP measurements of all the female patients within a selected time period. The measured values are plotted over colored areas to improve the ability to quickly identify outliers in a purely visual way. 

If the user clicks on any of the data points above, an “user history view” is rendered. In this case we can see all the lab measurements (that our cardiac risk calculator is interested in) for the selected patient, within the selected time interval. From here we can go to the risk calculator for the selected patient, or to go back to the history view for the entire cohort.

This app is viewable live using a combination of synthetic and fully de-identified real world data at [https://pop-cardiac-risk.herokuapp.com](https://pop-cardiac-risk.herokuapp.com).


## Install
```sh
git clone https://github.com/chb/pop-cardiac-risk
cd pop-cardiac-risk
npm i
```

## Run
The local development version of the app is designed to connect to local version of the Population Health App Server which is not publicly available yet. To workaround that, you need to use the production build which will connect to the online database. To do so run:
```sh
# If you need to create a fresh build
# npm run build
npx serve -s build/
```

If you're making local changes, rebuild manually and re-run the serve command to ensure changes are visible.