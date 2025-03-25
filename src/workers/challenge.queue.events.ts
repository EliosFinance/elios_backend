import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';

@QueueEventsListener('challenge')
export class ChallengeQueueEventsListener extends QueueEventsHost {
    logger = new Logger('Queue');

    @OnQueueEvent('added')
    onAdded(job: { jobId: string; name: string }) {
        this.logger.log(`Job ${job.jobId} has been added to the queue`);
    }
}
