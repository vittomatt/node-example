/* eslint-disable @typescript-eslint/require-await */
import Page from "@shared/Page";
import RoutineNotFoundError from "@routine/application/error/RoutineNotFoundError";
import { Repository as RoutineRepository } from "@routine/infrastructure/Repository";
import Routine from "@routine/domain/Routine";

class RoutineService {
    constructor(private readonly routineRepository: RoutineRepository) {}

    public async insert(routine: Routine): Promise<Routine> {
        return this.routineRepository.insert(routine);
    }

    public async insertBatch(routines: Array<Routine>): Promise<Array<Routine>> {
        return this.routineRepository.insertBatch(routines);
    }

    public async getAllRoutines(page: number, itemsPerPage: number): Promise<Page<Array<Routine>>> {
        return this.routineRepository.getAllRoutines(page, itemsPerPage);
    }

    public async getRoutineById(routineId: string): Promise<Routine | null> {
        return this.routineRepository.getRoutineById(routineId);
    }

    public async getRoutineByUserId(userId: string): Promise<Routine | null> {
        return this.routineRepository.getRoutineByUserId(userId);
    }

    public async deleteRoutineById(routineId: string): Promise<void> {
        const success = await this.routineRepository.deleteRoutineById(routineId);

        if (!success) {
            throw new RoutineNotFoundError();
        }
    }

    public async updateRoutineById(routineId: string, routine: Routine): Promise<Routine> {
        const updatedRoutine = await this.routineRepository.updateRoutineById(routineId, routine);

        if (!updatedRoutine) {
            throw new RoutineNotFoundError();
        }

        return updatedRoutine;
    }
}

export default RoutineService;
