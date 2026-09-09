import { clearLogs, logger } from '../utils/logger';
import fs from 'node:fs';
import path from 'node:path';

export default function globalSetup(): void {
  if (process.env.PRESERVE_LOGS !== 'true') {
    clearLogs();
    for (const artifactPath of ['reports/allure-results', 'reports/html', 'reports/junit', 'reports/allure-report']) {
      fs.rmSync(path.resolve(process.cwd(), artifactPath), { recursive: true, force: true });
    }
    logger.system('Log files cleared for new Playwright execution', { module: 'GlobalSetup' });
  }
}
