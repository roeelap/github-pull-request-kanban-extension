import { defineManifest } from '@crxjs/vite-plugin';
import pkg from '../package.json';

export default defineManifest({
  manifest_version: 3,
  name: 'GitHub PR Kanban',
  version: pkg.version,
  description: pkg.description,
  permissions: ['storage', 'alarms', 'scripting'],
  host_permissions: ['https://github.com/*'],
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'GitHub PR Kanban',
  },
  options_page: 'src/options/index.html',
  content_scripts: [
    {
      matches: ['https://github.com/*/*/pulls*'],
      js: ['src/main-world/hook.ts'],
      world: 'MAIN',
      run_at: 'document_start',
    },
    {
      matches: ['https://github.com/*/*/pulls*'],
      js: ['src/content/index.tsx'],
      run_at: 'document_idle',
    },
  ],
});
