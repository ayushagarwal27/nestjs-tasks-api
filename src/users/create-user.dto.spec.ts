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

  it('should fail on invalid password', async () => {
    // Arrange
    dto.password = 'john1234';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBe(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isStrongPassword');
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
