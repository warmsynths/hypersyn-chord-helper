import { generateUUID } from './utils';

describe('utils module', () => {
  it('generateUUID returns a string of correct format', () => {
    const uuid = generateUUID();
    expect(typeof uuid).toBe('string');
    expect(uuid).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
  });

  it('generateUUID returns unique values', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });
});
