import { expect, type APIRequestContext } from '@playwright/test';
import { apiEndpoints } from '../../constants/apiEndpoints';
import type { SimulatorRegistrationData, SimulatorUpdateData } from '../../test-data/testDataFactory';
import {
  boilerSettingsTypeLabel,
  getBoilerSettingsBySoftwareVersion,
  getBoilerTypeFromSoftwareVersion,
  type BoilerSettingsData,
  type BoilerSettingsType
} from '../../test-data/settingsDataHelper';
import { logger } from '../../utils/logger';
import { recordSimulatorUpdatePayload } from '../../utils/simulatorPayloadRecorder';
import { AuthService } from '../auth/authService';

export type SimulatorRegistrationResponse = {
  version: string;
  code: string;
  uniqueKey: string;
};

export type SimulatorUpdateResponse = {
  response: {
    success: boolean;
    update: Record<string, unknown>;
    file: Record<string, unknown>;
  };
  boilerSettingsType: BoilerSettingsType;
  boilerSettingsTypeLabel: string;
  boilerSettings: BoilerSettingsData;
};

export class SimulatorService {
  private authToken?: string;

  constructor(private readonly request: APIRequestContext) {}

  async registerSimulator(payload: SimulatorRegistrationData): Promise<SimulatorRegistrationResponse> {
    logger.api('Simulator register request started', {
      module: 'SimulatorService',
      endpoint: apiEndpoints.simulator.register,
      nuro: payload.nuro,
      sola: payload.sola
    });
    const response = await this.request.post(apiEndpoints.simulator.register, {
      data: payload,
      headers: await this.authHeaders()
    });
    logger.api('Simulator register response received', {
      module: 'SimulatorService',
      endpoint: apiEndpoints.simulator.register,
      status: response.status(),
      ok: response.ok()
    });
    if (!response.ok()) {
      logger.error('Simulator register failed', { module: 'SimulatorService', status: response.status() });
      throw new Error(`Simulator register failed: ${response.status()} ${response.statusText()}`);
    }

    const registration = (await response.json()) as SimulatorRegistrationResponse;
    expect(registration.code, 'Simulator register response should include six-character code').toMatch(/^[A-Za-z0-9]{6}$/);
    expect(registration.uniqueKey, 'Simulator register response should include uniqueKey').toBeTruthy();
    return registration;
  }

  async updateSimulator(payload: SimulatorUpdateData): Promise<SimulatorUpdateResponse> {
    const boilerSettingsType = getBoilerTypeFromSoftwareVersion(payload.data.software);
    const boilerSettings = getBoilerSettingsBySoftwareVersion(payload.data.software);
    logger.api('Simulator update settings resolved', {
      module: 'SimulatorService',
      endpoint: apiEndpoints.simulator.update,
      software: payload.data.software,
      boilerSettingsType,
      boilerSettingsTypeLabel: boilerSettingsTypeLabel(boilerSettingsType)
    });
    expect(boilerSettings.errorCodes.length, 'Selected Boiler settings should include Error Codes').toBeGreaterThan(0);
    expect(boilerSettings.stateCodes.length, 'Selected Boiler settings should include State Codes').toBeGreaterThan(0);
    expect(boilerSettings.statusCodes.length, 'Selected Boiler settings should include Status Codes').toBeGreaterThan(0);
    expect(boilerSettings.userTitles.length, 'Selected Boiler settings should include User Titles').toBeGreaterThan(0);
    expect(boilerSettings.relayText.length, 'Selected Boiler settings should include Relay Text').toBeGreaterThan(0);
    expect(boilerSettings.activeModeDemand.length, 'Selected Boiler settings should include Active Mode Demand').toBeGreaterThan(0);
    if (!boilerSettings.serviceReps.length) {
      logger.warn('Boiler settings Service Reps data is empty; simulator update does not require this section', {
        module: 'SimulatorService',
        boilerSettingsType
      });
    }

    logger.api('Simulator update request started', {
      module: 'SimulatorService',
      endpoint: apiEndpoints.simulator.update,
      nuro: payload.data.nuro,
      sola: payload.data.sola,
      software: payload.data.software,
      key: payload.key
    });
    recordSimulatorUpdatePayload(payload, boilerSettingsType);
    const response = await this.request.post(apiEndpoints.simulator.update, {
      data: payload,
      headers: await this.authHeaders()
    });
    logger.api('Simulator update response received', {
      module: 'SimulatorService',
      endpoint: apiEndpoints.simulator.update,
      status: response.status(),
      ok: response.ok()
    });
    if (!response.ok()) {
      logger.error('Simulator update failed', { module: 'SimulatorService', status: response.status() });
      throw new Error(`Simulator update failed: ${response.status()} ${response.statusText()}`);
    }

    const update = (await response.json()) as SimulatorUpdateResponse;
    expect(update.response?.success, 'Simulator update response success should be true').toBe(true);
    logger.api('Simulator update succeeded', {
      module: 'SimulatorService',
      nuro: payload.data.nuro,
      software: payload.data.software,
      boilerSettingsType
    });
    return {
      ...update,
      boilerSettingsType,
      boilerSettingsTypeLabel: boilerSettingsTypeLabel(boilerSettingsType),
      boilerSettings
    };
  }

  private async authHeaders(): Promise<Record<string, string>> {
    if (!this.authToken) {
      this.authToken = (await new AuthService(this.request).login('pkAdmin')).token;
    }
    return { Authorization: `Bearer ${this.authToken}` };
  }
}
