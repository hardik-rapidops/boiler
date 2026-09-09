import fs from 'node:fs';
import path from 'node:path';
import type { SimulatorUpdateData } from '../test-data/testDataFactory';
import { boilerSettingsTypeLabel, type BoilerSettingsType } from '../test-data/settingsDataHelper';
import { isoNow } from './dateTime';
import { logger } from './logger';

const payloadDirectory = path.resolve(process.cwd(), 'reports/payloads/simulator-update');

export function recordSimulatorUpdatePayload(
  payload: SimulatorUpdateData,
  boilerSettingsType: BoilerSettingsType
): void {
  fs.mkdirSync(payloadDirectory, { recursive: true });

  const recordedAt = isoNow();
  const record = {
    recordedAt,
    boilerSettingsType,
    boilerSettingsTypeLabel: boilerSettingsTypeLabel(boilerSettingsType),
    payload
  };
  const safeNuro = String(payload.data.nuro).replace(/[^A-Za-z0-9]/g, '-');
  const timestamp = recordedAt.replace(/[:.]/g, '-');
  const payloadFile = path.join(payloadDirectory, `${timestamp}-${boilerSettingsType}-${safeNuro}.json`);
  const latestTypeFile = path.join(payloadDirectory, `latest-${boilerSettingsType}.json`);

  fs.writeFileSync(payloadFile, `${JSON.stringify(record, null, 2)}\n`);
  fs.writeFileSync(latestTypeFile, `${JSON.stringify(record, null, 2)}\n`);
  logger.system('Simulator update payload recorded', {
    module: 'SimulatorPayloadRecorder',
    boilerSettingsType,
    nuro: payload.data.nuro,
    payloadFile
  });
}
