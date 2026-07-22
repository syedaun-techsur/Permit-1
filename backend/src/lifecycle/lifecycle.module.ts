import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LifecycleStage } from '../permits/entities/lifecycle-stage.entity';
import { LifecycleService } from './lifecycle.service';

@Module({
  imports: [TypeOrmModule.forFeature([LifecycleStage])],
  providers: [LifecycleService],
  exports: [LifecycleService],
})
export class LifecycleModule {}
