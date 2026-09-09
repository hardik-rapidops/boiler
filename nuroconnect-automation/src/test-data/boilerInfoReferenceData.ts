import fs from 'node:fs';
import path from 'node:path';
import { loadBoilerUpdatePayloadReference } from './boilerUpdatePayloadReference';
import type { BoilerSettingsType } from './settingsDataHelper';

export type BoilerInfoReferenceField = {
  propertyKey: string;
  payloadPropertyKey: string;
  rawValue: number;
  label: string;
  displayedValue: string;
};

export type SetpointReferenceField = BoilerInfoReferenceField & {
  writeFlag: 'chsetpointwrite' | 'dhwsetpointwrite' | 'dhwtanksetpointwrite';
};

export type BoilerColorLogicRule = {
  errortype: number;
  condition: 'equals' | 'greaterThanOrEqual';
  color: string;
  cssClass: string;
  backgroundColor: string;
};

type BoilerInfoReferenceFile = {
  sections: {
    temperatureSensors: {
      title: string;
      fields: BoilerInfoReferenceField[];
    };
    setpointProperties: {
      title: string;
      fields: SetpointReferenceField[];
    };
    analogSignalProperties: {
      title: string;
      fields: BoilerInfoReferenceField[];
    };
    stateStatusErrorProperties: {
      title: string;
      fields: BoilerInfoReferenceField[];
    };
    colorLogic: {
      title: string;
      rules: BoilerColorLogicRule[];
    };
  };
};

const referenceFile = path.resolve(process.cwd(), 'test-data/boilers/boiler-info-reference.json');

export function loadTemperatureSensorReference(): BoilerInfoReferenceField[] {
  if (!fs.existsSync(referenceFile)) {
    throw new Error(`Boiler Info reference data is missing: ${referenceFile}`);
  }

  const reference = JSON.parse(fs.readFileSync(referenceFile, 'utf8')) as BoilerInfoReferenceFile;
  const fields = reference.sections?.temperatureSensors?.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('Temperature Sensors reference data is empty.');
  }

  const updateReference = loadBoilerUpdatePayloadReference();
  for (const field of fields) {
    if (!field.propertyKey || !field.payloadPropertyKey || !field.label || !field.displayedValue) {
      throw new Error(`Temperature Sensor reference row is incomplete: ${JSON.stringify(field)}`);
    }
    const rawValue = updateReference[field.payloadPropertyKey];
    if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) {
      throw new Error(`Temperature Sensor ${field.propertyKey} must use a decimal numeric rawValue.`);
    }
    field.rawValue = rawValue;
  }
  return fields.map((field) => ({ ...field }));
}

export function temperatureSensorPayloadData(
  fields: BoilerInfoReferenceField[]
): Record<string, number> {
  return Object.fromEntries(fields.map((field) => [field.payloadPropertyKey, field.rawValue]));
}

export function temperatureSensorExpectedFromPayload(
  fields: BoilerInfoReferenceField[],
  payloadData: Record<string, string | number | boolean>
): BoilerInfoReferenceField[] {
  return fields.map((field) => {
    const value = payloadData[field.payloadPropertyKey];
    if (typeof value !== 'number') {
      throw new Error(`Latest Boiler data does not contain decimal ${field.payloadPropertyKey}.`);
    }
    const displayedValue = value === 33024 ? 'Open' : `${Number.isInteger(value / 10) ? value / 10 : (value / 10).toFixed(1)} °F`;
    return { ...field, rawValue: value, displayedValue };
  });
}

export function loadSetpointReference(): SetpointReferenceField[] {
  if (!fs.existsSync(referenceFile)) {
    throw new Error(`Boiler Info reference data is missing: ${referenceFile}`);
  }
  const reference = JSON.parse(fs.readFileSync(referenceFile, 'utf8')) as BoilerInfoReferenceFile;
  const fields = reference.sections?.setpointProperties?.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('Setpoint Properties reference data is empty.');
  }

  const updateReference = loadBoilerUpdatePayloadReference();
  return fields.map((field) => {
    const rawValue = updateReference[field.payloadPropertyKey];
    if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) {
      throw new Error(`Setpoint ${field.propertyKey} must use a decimal numeric rawValue.`);
    }
    return { ...field, rawValue };
  });
}

export function setpointPayloadData(fields: SetpointReferenceField[]): Record<string, number> {
  return Object.fromEntries(fields.map((field) => [field.payloadPropertyKey, field.rawValue]));
}

export function setpointExpectedFromPayload(
  fields: SetpointReferenceField[],
  payloadData: Record<string, string | number | boolean>
): SetpointReferenceField[] {
  return fields.map((field) => {
    const value = payloadData[field.payloadPropertyKey];
    if (typeof value !== 'number') {
      throw new Error(`Latest Boiler data does not contain decimal ${field.payloadPropertyKey}.`);
    }
    const displayedValue = `${Number.isInteger(value / 10) ? value / 10 : (value / 10).toFixed(1)} \u00B0F`;
    return { ...field, rawValue: value, displayedValue };
  });
}

export function loadAnalogSignalReference(): BoilerInfoReferenceField[] {
  if (!fs.existsSync(referenceFile)) {
    throw new Error(`Boiler Info reference data is missing: ${referenceFile}`);
  }
  const reference = JSON.parse(fs.readFileSync(referenceFile, 'utf8')) as BoilerInfoReferenceFile;
  const fields = reference.sections?.analogSignalProperties?.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('Analog / Signal Properties reference data is empty.');
  }

  const updateReference = loadBoilerUpdatePayloadReference();
  return fields.map((field) => {
    if (!field.propertyKey || !field.payloadPropertyKey || !field.label || !field.displayedValue) {
      throw new Error(`Analog / Signal reference row is incomplete: ${JSON.stringify(field)}`);
    }
    const rawValue = updateReference[field.payloadPropertyKey];
    if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) {
      throw new Error(`Analog / Signal ${field.propertyKey} must use a decimal numeric rawValue.`);
    }
    return { ...field, rawValue };
  });
}

export function analogSignalPayloadData(fields: BoilerInfoReferenceField[]): Record<string, number> {
  return Object.fromEntries(fields.map((field) => [field.payloadPropertyKey, field.rawValue]));
}

export function analogSignalExpectedFromPayload(
  fields: BoilerInfoReferenceField[],
  payloadData: Record<string, string | number | boolean>
): BoilerInfoReferenceField[] {
  return fields.map((field) => {
    const value = payloadData[field.payloadPropertyKey];
    if (typeof value !== 'number') {
      throw new Error(`Latest Boiler data does not contain decimal ${field.payloadPropertyKey}.`);
    }
    return { ...field, rawValue: value };
  });
}

export function loadStateStatusErrorReference(): BoilerInfoReferenceField[] {
  if (!fs.existsSync(referenceFile)) {
    throw new Error(`Boiler Info reference data is missing: ${referenceFile}`);
  }
  const reference = JSON.parse(fs.readFileSync(referenceFile, 'utf8')) as BoilerInfoReferenceFile;
  const fields = reference.sections?.stateStatusErrorProperties?.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('State / Status / Error Properties reference data is empty.');
  }

  const updateReference = loadBoilerUpdatePayloadReference();
  return fields.map((field) => {
    if (!field.propertyKey || !field.payloadPropertyKey || !field.label || !field.displayedValue) {
      throw new Error(`State / Status / Error reference row is incomplete: ${JSON.stringify(field)}`);
    }
    const rawValue = updateReference[field.payloadPropertyKey];
    if (typeof rawValue !== 'number' || !Number.isFinite(rawValue)) {
      throw new Error(`State / Status / Error ${field.propertyKey} must use a decimal numeric rawValue.`);
    }
    return { ...field, rawValue };
  });
}

export function stateStatusErrorPayloadData(fields: BoilerInfoReferenceField[]): Record<string, number> {
  return Object.fromEntries(fields.map((field) => [field.payloadPropertyKey, field.rawValue]));
}

export function loadBoilerColorLogic(): BoilerColorLogicRule[] {
  if (!fs.existsSync(referenceFile)) {
    throw new Error(`Boiler Info reference data is missing: ${referenceFile}`);
  }
  const reference = JSON.parse(fs.readFileSync(referenceFile, 'utf8')) as BoilerInfoReferenceFile;
  const rules = reference.sections?.colorLogic?.rules;
  if (!Array.isArray(rules) || rules.length === 0) {
    throw new Error('Boiler Color Logic reference data is empty.');
  }

  return rules.map((rule) => {
    if (!Number.isInteger(rule.errortype) || !rule.condition || !rule.color || !rule.cssClass || !rule.backgroundColor) {
      throw new Error(`Boiler Color Logic rule is incomplete: ${JSON.stringify(rule)}`);
    }
    return { ...rule };
  });
}

export function getExpectedBoilerColorFromErrorType(
  errortype: number,
  boilerType?: BoilerSettingsType
): BoilerColorLogicRule {
  const rule = loadBoilerColorLogic().find((colorRule) =>
    colorRule.condition === 'greaterThanOrEqual'
      ? errortype >= colorRule.errortype
      : errortype === colorRule.errortype
  );
  if (!rule) {
    const boilerTypeContext = boilerType ? ` for Boiler type ${boilerType}` : '';
    throw new Error(`Boiler Color Logic is missing for errortype ${errortype}${boilerTypeContext}.`);
  }
  return rule;
}
