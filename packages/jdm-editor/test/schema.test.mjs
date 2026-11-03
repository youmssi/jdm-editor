import assert from 'node:assert/strict';
import { test } from 'node:test';

import { columnEnumSchema, decisionModelSchema } from '../dist/schema.js';

test('existing input and expression nodes retain their normalized defaults', () => {
  const graph = decisionModelSchema.parse({
    nodes: [
      { id: 'input', name: 'Request', type: 'inputNode' },
      {
        id: 'expression',
        name: 'Calculate',
        type: 'expressionNode',
        content: { expressions: [{ id: 'e' }], inputField: ' ' },
      },
    ],
  });
  assert.deepEqual(graph.edges, []);
  assert.deepEqual(graph.nodes[0], {
    id: 'input',
    name: 'Request',
    type: 'inputNode',
    position: { x: 0, y: 0 },
    content: { schema: '' },
  });
  assert.deepEqual(graph.nodes[1].content, {
    expressions: [{ id: 'e', key: '', value: '' }],
    passThrough: false,
    inputField: null,
    outputPath: null,
    executionMode: 'single',
  });
});

test('decision-table records keep dynamic column keys and normalize null cells', () => {
  const graph = decisionModelSchema.parse({
    nodes: [
      {
        id: 'table',
        name: 'Eligibility',
        type: 'decisionTableNode',
        content: {
          hitPolicy: null,
          inputs: [],
          outputs: [],
          rules: [{ '_id': 'rule-1', 'income-column': null, 'result-column': 'approve' }],
        },
      },
    ],
  });
  assert.equal(graph.nodes[0].content.hitPolicy, 'first');
  assert.deepEqual(graph.nodes[0].content.rules, [
    { '_id': 'rule-1', 'income-column': '', 'result-column': 'approve' },
  ]);
});

test('malformed built-in nodes cannot fall through the unknown-node compatibility path', () => {
  assert.equal(
    decisionModelSchema.safeParse({ nodes: [{ id: 'e', name: 'Broken', type: 'expressionNode' }] }).success,
    false,
  );
  assert.equal(
    decisionModelSchema.safeParse({
      nodes: [{ id: 'future', name: 'Future', type: 'futureNode', content: { value: 7 } }],
    }).success,
    true,
  );
  assert.equal(
    decisionModelSchema.safeParse({ nodes: [], edges: [{ id: 'edge', sourceId: 'a', targetId: 'b', type: 'unknown' }] })
      .success,
    false,
  );
});

test('column enums preserve valid inline options and reject malformed values', () => {
  const options = { type: 'inline', values: [{ label: 'Approved', value: 'approve' }], loose: false };
  assert.deepEqual(columnEnumSchema.parse(options), options);
  assert.equal(columnEnumSchema.safeParse({ type: 'inline', values: [{ label: 'Missing value' }] }).success, false);
  assert.deepEqual(columnEnumSchema.parse({ type: 'ref', ref: 'riskBands' }), { type: 'ref', ref: 'riskBands' });
});
