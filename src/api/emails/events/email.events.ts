export class EmailSentEvent {
    constructor(
        public readonly emailId: number,
        public readonly userId: number,
        public readonly templateType: string,
    ) {}
}

export class EmailOpenedEvent {
    constructor(
        public readonly emailId: number,
        public readonly userId: number,
        public readonly openedAt: Date,
    ) {}
}

export class EmailVerifiedEvent {
    constructor(
        public readonly userId: number,
        public readonly email: string,
    ) {}
}

export class TwoFactorVerifiedEvent {
    constructor(
        public readonly userId: number,
        public readonly purpose: string,
    ) {}
}
