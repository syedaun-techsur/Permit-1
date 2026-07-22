import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LifecycleStage } from '../permits/entities/lifecycle-stage.entity';
import { ApplicationStatus } from '../permits/entities/permit-application.entity';

@Injectable()
export class LifecycleService {
  constructor(
    @InjectRepository(LifecycleStage)
    private readonly stageRepo: Repository<LifecycleStage>,
  ) {}

  async createStage(
    applicationId: string,
    stage: ApplicationStatus,
    actorId: string,
  ): Promise<LifecycleStage> {
    const entry = this.stageRepo.create({
      applicationId,
      stage,
      actorId,
      enteredAt: new Date(),
    });
    return this.stageRepo.save(entry);
  }

  async getStages(applicationId: string): Promise<LifecycleStage[]> {
    return this.stageRepo.find({
      where: { applicationId },
      order: { enteredAt: 'ASC' },
    });
  }
}
