import { execFileSync } from 'node:child_process';
import { logger } from '../../utils/logger';

export class SettingsExportService {
  static exportBoilerSettings(): void {
    logger.system('Boiler Settings export started', { module: 'SettingsExportService' });
    try {
      const output = execFileSync(process.execPath, ['scripts/export-settings-data.js'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          EXPORT_COMBINED_BOILER_SETTINGS: 'true'
        },
        stdio: 'pipe'
      });
      logger.system('Boiler Settings export completed', {
        module: 'SettingsExportService',
        output: output.toString().trim()
      });
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error);
      const stderr =
        typeof error === 'object' && error !== null && 'stderr' in error
          ? Buffer.from((error as { stderr?: Buffer }).stderr ?? '').toString().trim()
          : '';

      logger.error('Boiler Settings export failed', { module: 'SettingsExportService', error: stderr || details });
      throw new Error(
        [
          'Boiler Settings export failed before Boiler Creation tests.',
          'Settings must be exported successfully so Boiler type and settings validations use fresh data.',
          stderr || details
        ].join('\n')
      );
    }
  }
}
