const fs = require('node:fs');
const path = require('node:path');

const resultsDirectory = path.resolve(process.cwd(), 'reports/allure-results');

if (!fs.existsSync(resultsDirectory)) {
  throw new Error(`Allure results directory is missing: ${resultsDirectory}`);
}

for (const fileName of fs.readdirSync(resultsDirectory).filter((name) => name.endsWith('-result.json'))) {
  const resultPath = path.join(resultsDirectory, fileName);
  const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
  const videos = collectVideoAttachments(result.steps ?? []);
  result.attachments ??= [];

  for (const video of videos) {
    if (!result.attachments.some((attachment) => attachment.source === video.source)) {
      result.attachments.push({
        name: `Test Video - ${video.name}`,
        source: video.source,
        type: video.type
      });
    }
  }

  fs.writeFileSync(resultPath, `${JSON.stringify(result)}\n`);
}

function collectVideoAttachments(steps) {
  const videos = [];
  for (const step of steps) {
    videos.push(...(step.attachments ?? []).filter((attachment) => attachment.type === 'video/webm'));
    videos.push(...collectVideoAttachments(step.steps ?? []));
  }
  return videos;
}
