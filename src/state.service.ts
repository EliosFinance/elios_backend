import { Injectable } from '@nestjs/common';

@Injectable()
export class StateService {
    private states = new Map<string, number>();

    async saveState(state: string, userId: number) {
        this.states.set(state, userId);
    }

    async getUserIdFromState(state: string): Promise<number | undefined> {
        return this.states.get(state);
    }

    async deleteState(state: string): Promise<boolean> {
        if (this.states.has(state)) {
            this.states.delete(state);
            return true;
        }
        return false;
    }
}
