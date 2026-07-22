import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    role?: UserRole;
  }): Promise<User> {
    const user = this.usersRepo.create({
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      fullName: data.fullName.trim(),
      role: data.role ?? UserRole.APPLICANT,
      isActive: true,
    });
    return this.usersRepo.save(user);
  }

  async updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.usersRepo.update(userId, { passwordHash });
  }
}
