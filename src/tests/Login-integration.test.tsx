import { makeUserUseCases } from '../core/factories/makeUserUseCases';
import { MockUserRepository } from '../core/infra/repositories/MockUserRepository';

describe('User use-cases integration (no RN)', () => {
  beforeEach(() => {
    MockUserRepository.getInstance().reset();
  });

  it('registers and logs in a user using use-cases', async () => {
    const { registerUser, loginUser } = makeUserUseCases();

    const email = 'test@example.com';
    const password = 'password123';

    const created = await registerUser.execute({
      name: 'Test User',
      email,
      password,
    });

    expect(created).toBeDefined();

    const fetched = await MockUserRepository.getInstance().findByEmail(email);
    expect(fetched).not.toBeNull();

    const logged = await loginUser.execute({ email, password });
    expect(logged).toBeDefined();
    expect(logged.email.value).toBe(email);
  });
});
