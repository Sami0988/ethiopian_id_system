// src/common/validation/ajv.config.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { customFormats } from './formats';

export function createAjv() {
  const ajv = new Ajv({
    allErrors: true,
    removeAdditional: 'all',
    useDefaults: true,
    coerceTypes: true,
  });

  addFormats(ajv);

  for (const [name, format] of Object.entries(customFormats)) {
    ajv.addFormat(name, format);
  }

  return ajv;
}
