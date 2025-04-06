export type ChallengeStateMachineConfigType = {
    id: string;
    initial: string;
    states:
        | {
              [key in keyof typeof ChallengeStepsEnum]: {
                  on: {
                      [key in keyof typeof ChallengeEventEnum]: {
                          target: ChallengeStepsEnum;
                      };
                  };
              };
          }
        | {};
};
export enum ChallengeStepsEnum {
    PENDING = 'PENDING',
    START = 'START',
    PROGRESS = 'PROGRESS',
    PAUSE = 'PAUSE',
    CANCEL = 'CANCEL',
    REJECT = 'REJECT',
    FAIL = 'FAIL',
    COMPLETE = 'COMPLETE',
    REWARD_CLAIMED = 'REWARD_CLAIMED',
    REWARD_TO_CLAIM = 'REWARD_TO_CLAIM',
    EXPIRE = 'EXPIRE',
    END = 'END',
    CLOSE = 'CLOSE',
}

export enum ChallengeEventEnum {
    START = 'START',
    PENDING = 'PENDING',
    PROGRESS = 'PROGRESS',
    PAUSED = 'PAUSED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
    FAILED = 'FAILED',
    COMPLETED = 'COMPLETED',
    EXPIRED = 'EXPIRED',
    REWARD_TO_CLAIM = 'REWARD_TO_CLAIM',
    REWARD_CLAIMED = 'REWARD_CLAIMED',
    CLOSE = 'CLOSE',
    END = 'END',
}

export const CHALLENGE_QUEUE_NAME = 'challenge';
