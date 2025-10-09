import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /*
    shouldn't test external library code
    test if bcrypt.hash is called with proper arguments
    mocks and spies
    mocks alternative implementation
   */
  it('should hash password', async () => {
    const mockHash = 'hashed_password';
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
    const password = 'password123';
    const result = await service.hash(password);
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(result).toBe(mockHash);
  });

  it('should verify on correct password', async () => {
    const plainPassword = 'password123';
    const hashedPasswordMock = 'hashed_password';
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.verify(plainPassword, hashedPasswordMock);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      plainPassword,
      hashedPasswordMock,
    );
    expect(result).toBe(true);
  });

  it('should fail on incorrect password', async () => {
    const plainPassword = 'password123';
    const hashedPasswordMock = 'hashed_password';
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const result = await service.verify(plainPassword, hashedPasswordMock);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      plainPassword,
      hashedPasswordMock,
    );
    expect(result).toBe(false);
  });
});
