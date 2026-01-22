// src/common/validation/formats.ts
import type { Format } from 'ajv';

export const customFormats: Record<string, Format> = {
  uuid: {
    type: 'string',
    validate: v => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  },

  slug: {
    type: 'string',
    validate: v => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
  },

  'ethiopian-phone': {
    type: 'string',
    validate: v => /^(?:\+251|0)[79]\d{8}$/.test(v),
  },

  'tenant-id': {
    type: 'string',
    validate: v => /^tenant_[a-zA-Z0-9]{16}$/.test(v),
  },
};
