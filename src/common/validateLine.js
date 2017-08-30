import config from '../config';

const Ajv = require('ajv');
const ajv = new Ajv();

let lineSchema = {
  type: 'object',
  properties: {
    start: { $ref: '#/definitions/StartPoint' },
    end: { $ref: '#/definitions/EndPoint' },
    color: {
      type: 'string',
      pattern: '^#[0-9a-f]{6}$',
    },
    id: {
      type: 'string',
      pattern: '^#[0-9a-f]{6}$',
    },
  },
  additionalProperties: false,
  definitions: {
    'StartPoint': {
      type: 'array',
      maxItems: 2,
      minItems: 2,
      items: [{ $ref: '#/definitions/Column' }, { $ref: '#/definitions/Row' }],
    },
    'EndPoint': {
      type: 'array',
      maxItems: 2,
      minItems: 2,
      items: [{ $ref: '#/definitions/Column' }, { $ref: '#/definitions/Row' }],
    },
    'Column': {
      type: 'integer',
      minimum: 0,
      exclusiveMaximum: config.GRID_NUMBER_COL,
    },
    'Row': {
      type: 'integer',
      minimum: 0,
      exclusiveMaximum: config.GRID_NUMBER_ROW,
    },
  },
};

export function lineIsValid(line) {
  let start = line.start;
  let end = line.end;

  // Compare line to valid schema
  let validateLine = ajv.compile(lineSchema);
  if (!validateLine(line)) return false;

  // If start point is same as end point
  if (start[0] == end[0] && start[1] == end[1]) {
    return false;
  } else {
    return true;
  }
}

