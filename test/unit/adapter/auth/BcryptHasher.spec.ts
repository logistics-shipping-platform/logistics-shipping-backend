import { BcryptHasher } from "../../../../src/adapter/outbound/auth";


describe('BcryptHasher', () => {
  const hasher = new BcryptHasher();
  const raw = 'mypassword';

  it('genera un hash y lo compara correctamente', async () => {
    const hash = await hasher.hash(raw);
    expect(hash.startsWith('$2')).toBe(true);
    const ok = await hasher.compare(raw, hash);
    expect(ok).toBe(true);
    const fail = await hasher.compare('otro', hash);
    expect(fail).toBe(false);
  });
});