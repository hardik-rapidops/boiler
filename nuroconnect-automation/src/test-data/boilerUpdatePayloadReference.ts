import fs from 'node:fs';
import path from 'node:path';

export type BoilerUpdateReferenceData = Record<string, string | number | boolean>;

type BoilerUpdateReferenceFile = {
  source: string;
  properties: BoilerUpdateReferenceData;
};

const referenceFile = path.resolve(process.cwd(), 'test-data/boilers/boiler-update-payload-reference.json');
const expectedPropertyCount = 41;

export function loadBoilerUpdatePayloadReference(): BoilerUpdateReferenceData {
  if (!fs.existsSync(referenceFile)) {
    throw new Error(`Boiler Update payload reference is missing: ${referenceFile}`);
  }

  const reference = JSON.parse(fs.readFileSync(referenceFile, 'utf8')) as BoilerUpdateReferenceFile;
  const entries = Object.entries(reference.properties ?? {});
  if (entries.length !== expectedPropertyCount) {
    throw new Error(`Boiler Update payload reference must contain exactly ${expectedPropertyCount} properties.`);
  }

  for (const [attribute, rawValue] of entries) {
    if (!attribute) throw new Error('Boiler Update payload reference contains an empty Attribute.');
    if (typeof rawValue === 'string' && /^0x[0-9a-f]+$/i.test(rawValue)) {
      throw new Error(`Boiler Update payload ${attribute} must use a decimal raw value, not hexadecimal.`);
    }
  }
  return { ...reference.properties };
}
