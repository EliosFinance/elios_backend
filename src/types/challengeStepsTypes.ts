export type ChallengeConfig = {
    id: string;
    currentState: string;
    initial: string;
    states: Record<string, { on: Record<string /* ChallengeEventEnum */, ChallengeStepsEnum> }>;
};

export type ChallengeEventEnum = {
    START: 'start';
    PROGRESS: 'progress';
    NEXT: 'NEXT';
    REJECTED: 'rejected';
    CANCEL: 'cancel';
    COMPLETE: 'complete';
    EXPIRE: 'expire';
    WAIT: 'wait';
    UNCOMPLETE: 'uncomplete';
};

export type ChallengeStepsEnum = {
    START: 'start';
    PROGRESS: 'progress';
    COMPLETED: 'completed';
    UNCOMPLETED: 'uncompleted';
    CANCELLED: 'cancelled';
    EXPIRED: 'expired';
    WAITING: 'waiting';
};
