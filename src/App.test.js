// @ts-nocheck

// import React from 'react';
// import { render } from '@testing-library/react';
// import App from './App';
import { calcASCVD } from "./lib"

describe("ascvd", () => {

  const optimal = {
    totalCholesterol     : 170,
    hdl                  : 50,
    sbp                  : 110,
    hypertensionTreatment: false,
    diabetes             : false,
    smoker               : false
  };

  const base = {
    ...optimal,
    age                  : 45,
    africanAmerican      : false,
    gender               : "M"
  };

  it('optimal 50yo white male -> 2.1', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: false,
      gender         : "M",
      age            : 50
    })).toEqual(2.1);
  });

  it('optimal 50yo black male -> 3.9', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: true,
      gender         : "M",
      age            : 50
    })).toEqual(3.9);
  });

  it('optimal 50yo black female -> 1.0', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: true,
      gender         : "F",
      age            : 50
    })).toEqual(1.0);
  });

  it('optimal 50yo white female -> 0.8', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: false,
      gender         : "F",
      age            : 50
    })).toEqual(0.8);
  });

  it('50yo white male with diabetes -> 4.0', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: false,
      gender         : "M",
      age            : 50,
      diabetes: true
    })).toEqual(4);
  });

  it('50yo black male with diabetes -> 7.2', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: true,
      gender         : "M",
      age            : 50,
      diabetes: true
    })).toEqual(7.2);
  });

  it('50yo black female with diabetes -> 2.4', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: true,
      gender         : "F",
      age            : 50,
      diabetes: true
    })).toEqual(2.4);
  });

  it('50yo white female with diabetes -> 1.6', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: false,
      gender         : "F",
      age            : 50,
      diabetes: true
    })).toEqual(1.6);
  });

  it('worst white male -> 92.7', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: false,
      gender         : "M",
      age            : 79,
      diabetes: true,
      smoker: true,
      hypertensionTreatment: true,
      hdl: 20,
      totalCholesterol: 320,
      sbp: 200
    })).toEqual(92.7);
  });

  it('worst black male -> 96.5', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: true,
      gender         : "M",
      age            : 79,
      diabetes: true,
      smoker: true,
      hypertensionTreatment: true,
      hdl: 20,
      totalCholesterol: 320,
      sbp: 200
    })).toEqual(96.5);
  });

  it('worst black female -> 73.9', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: true,
      gender         : "F",
      age            : 79,
      diabetes: true,
      smoker: true,
      hypertensionTreatment: true,
      hdl: 20,
      totalCholesterol: 320,
      sbp: 200
    })).toEqual(73.9);
  });

  it('worst white female -> 85.5', () => {
    expect(calcASCVD({
      ...base,
      africanAmerican: false,
      gender         : "F",
      age            : 79,
      diabetes: true,
      smoker: true,
      hypertensionTreatment: true,
      hdl: 20,
      totalCholesterol: 320,
      sbp: 200
    })).toEqual(85.5);
  });

  it('custom test 1', () => {
    expect(calcASCVD({
      africanAmerican : false,
      gender          : "M",
      age             : 79,
      diabetes        : false,
      smoker          : true,
      hypertensionTreatment: false,
      hdl             : 88.3,
      totalCholesterol: 254.9,
      sbp             : 107
    })).toEqual(21.7);
  });
});
