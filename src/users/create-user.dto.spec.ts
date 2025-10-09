import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  let dto = new CreateUserDto();

  beforeEach(() => {
    dto = new CreateUserDto();
    dto.email = 'john@email.com';
    dto.name = 'John';
    dto.password = '12345Qwerty$';
  });

  it('should validate complete valid data', async () => {
    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(0);
  });

  it('should fail on invalid email', async () => {
    // Arrange
    dto.email = 'johnemail.com';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  const testPassword = async (password: string, message: string) => {
    // Arrange
    dto.password = password;

    // Act
    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');
    const messages = Object.values(passwordError?.constraints ?? {});

    // Assert
    expect(passwordError).not.toBeUndefined();
    expect(messages).toContain(message);
  };

  it('should fail without 1 uppercase letter in password', async () => {
    await testPassword(
      '12333as$ss',
      'password must contain at least 1 uppercase letter',
    );
  });

  it('should fail without at-least 1 number in password', async () => {
    await testPassword('asasA$as', 'password must contain at least 1 number');
  });

  it('password should fail without at-least 1 special character', async () => {
    await testPassword(
      'asa12sAas',
      'Password must contain at least 1 special character',
    );
  });

  it('should fail on invalid name', async () => {
    // Arrange
    dto.name = 'jhn';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
});
