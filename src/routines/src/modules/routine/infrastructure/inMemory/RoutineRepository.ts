/* eslint-disable @typescript-eslint/naming-convention */
import { RedisClientType } from "redis";

import Page from "@shared/Page";
import Routine from "modules/routine/domain/Routine";
import { Repository } from "modules/routine/infrastructure/Repository";
import RoutineDao, {
    generateUniqueRoutineKey,
    generateRoutineKey,
} from "modules/routine/infrastructure/inMemory/RoutineDao";
import {
    fromDaoToModel as fromRoutineDaoToModel,
    fromModelToDao as fromModelToRoutineDao,
} from "modules/routine/infrastructure/inMemory/routineParsers";
import { KEY_ROOT } from "@shared/db/inMemory/InMemoryDb";

class RoutineRepository implements Repository {
    readonly client: RedisClientType;

    constructor(db: RedisClientType) {
        this.client = db;
    }

    public async insert(routine: Routine): Promise<Routine> {
        const routineToSave: RoutineDao = await fromModelToRoutineDao(routine);

        await this.client.sAdd(generateUniqueRoutineKey(), routineToSave.id);
        await this.client.json.set(generateRoutineKey(routineToSave.id), KEY_ROOT, routineToSave as any);

        const newRoutine: Routine = await fromRoutineDaoToModel(routineToSave);

        return newRoutine;
    }

    public async insertBatch(routines: Array<Routine>): Promise<Array<Routine>> {
        const routinesPromises = routines.map(async (routine) => this.insert(routine));
        const insertedRoutines = await Promise.all(routinesPromises);

        return insertedRoutines;
    }

    public async updateRoutineById(routineId: string, routine: Routine): Promise<Routine | null> {
        const routineToUpdate = await this.getRoutineByUserId(routineId);

        if (!routineToUpdate) {
            return null;
        }

        if (routine.id !== routineToUpdate.id) {
            await this.client.sRem(generateUniqueRoutineKey(), routineToUpdate.id);
            await this.client.sAdd(generateUniqueRoutineKey(), routine.id);
        }

        const routineDao: RoutineDao = await fromModelToRoutineDao(routine);

        await this.client.json.set(generateRoutineKey(routineId), KEY_ROOT, routineDao as any);

        const updatedRoutine: Routine = await fromRoutineDaoToModel(routineDao);

        return updatedRoutine;
    }

    public async deleteRoutineById(userId: string): Promise<boolean> {
        const routine = await this.getRoutineByUserId(userId);

        if (!routine) {
            return false;
        }

        const routineDao: RoutineDao = await fromModelToRoutineDao(routine);

        await this.client.sRem(generateUniqueRoutineKey(), routineDao.id);
        await this.client.json.del(generateRoutineKey(userId), KEY_ROOT);

        return true;
    }

    public async getAllRoutines(page: number, itemsPerPage: number): Promise<Page<Array<Routine>>> {
        const routineIds: Array<string> = await this.client.sort(generateUniqueRoutineKey(), {
            BY: "nosort",
            DIRECTION: "ASC",
            LIMIT: {
                offset: page - 1,
                count: itemsPerPage,
            },
        });

        // TODO: this is an error
        const routinesPromises = routineIds?.map(async (routineId) => this.getRoutineByUserId(routineId)) ?? [];
        const routines: Array<Routine> = await Promise.all(routinesPromises);

        return new Page<Array<Routine>>({
            data: routines,
            currentPage: page,
            totalNumberOfDocuments: routines.length,
            itemsPerPage,
        });
    }

    public async getRoutineByUserId(userId: string): Promise<Routine | null> {
        const routinesDao: Array<RoutineDao> = (await this.client.json.get(generateRoutineKey(userId), {
            path: KEY_ROOT,
        })) as unknown as Array<RoutineDao>;

        if (!routinesDao) {
            return null;
        }

        const routine: Routine = await fromRoutineDaoToModel(routinesDao[0]);

        return routine;
    }
}

export default RoutineRepository;
