import { OnQueueEvent, QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { CHALLENGE_QUEUE_NAME } from '@src/types/ChallengeStepsTypes';

@QueueEventsListener(CHALLENGE_QUEUE_NAME)
export class ChallengeQueueEventsListener extends QueueEventsHost {
    logger = new Logger('Queue');

    @OnQueueEvent('added')
    onAdded(job: { jobId: string; name: string }) {
        this.logger.log(`Job ${job.jobId} has been added to the queue`);
    }
}
