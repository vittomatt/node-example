import { Repos, Repository } from "@shared/repositories/Repository";
import InMemoryRoutineRepository from "@routine/infrastructure/inMemory/RoutineRepository";

class InMemoryRepository implements Repository {
    readonly client: any;

    constructor(db: any) {
        this.client = db;
    }

    public getRepos(): Repos {
        return {
            routineRepository: new InMemoryRoutineRepository(this.client),
        };
    }
}

export default InMemoryRepository;
