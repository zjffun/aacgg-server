import { Module } from '@nestjs/common';
import { CommonController } from './index.controller';

@Module({
  controllers: [CommonController],
})
export class CommonModule {}
