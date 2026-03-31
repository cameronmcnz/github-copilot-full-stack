import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { load } from 'js-yaml';

const source = resolve(process.cwd(), '..', 'openapi.yaml');
const target = resolve(process.cwd(), 'public', 'openapi.yaml');
const proxyPath = resolve(process.cwd(), 'proxy.conf.json');

if (!existsSync(source)) {
  console.error('[sync-openapi] Source contract not found:', source);
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log('[sync-openapi] Copied', source, 'to', target);

if (!existsSync(proxyPath)) {
  console.warn('[sync-openapi] proxy.conf.json not found, skipping proxy target update.');
  process.exit(0);
}

const yamlText = readFileSync(source, 'utf8');
const spec = load(yamlText);
const servers = Array.isArray(spec?.servers) ? spec.servers : [];

const matchServer = (keywords) => {
  const normalized = keywords.map((keyword) => keyword.toLowerCase());
  return servers.find((server) => {
    if (!server || typeof server.url !== 'string') {
      return false;
    }

    const description = typeof server.description === 'string' ? server.description.toLowerCase() : '';
    return normalized.some((keyword) => description.includes(keyword));
  });
};

const expressServer = matchServer(['express']);
const flaskServer = matchServer(['flask']);
const springServer = matchServer(['spring']);

const proxyConfig = JSON.parse(readFileSync(proxyPath, 'utf8'));
let updated = false;

const setTarget = (route, url, label) => {
  if (!proxyConfig[route] || typeof proxyConfig[route] !== 'object') {
    return;
  }

  if (typeof url === 'string' && proxyConfig[route].target !== url) {
    proxyConfig[route].target = url;
    updated = true;
    console.log(`[sync-openapi] Updated ${label} proxy target to ${url}`);
  }
};

setTarget('/api/express', expressServer?.url, 'ExpressJS');
setTarget('/api/flask', flaskServer?.url, 'Flask');
setTarget('/api/spring', springServer?.url, 'Spring Boot');

if (updated) {
  writeFileSync(proxyPath, `${JSON.stringify(proxyConfig, null, 2)}\n`, 'utf8');
} else {
  console.log('[sync-openapi] Proxy targets already match OpenAPI servers.');
}
