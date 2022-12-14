import Page from "@shared/Page";
import User from "@user/domain/User";

interface Repository {
    insert: (user: User) => Promise<User>;
    insertBatch: (users: Array<User>) => Promise<Array<User>>;
    updateUserById: (userId: string, user: User) => Promise<User | null>;
    deleteUserById: (userId: string) => Promise<boolean>;
    getAllUsers(page: number, itemsPerPage: number): Promise<Page<Array<User>>>;
    getUserById: (userId: string) => Promise<User | null>;
    getUserByEmail: (email: string) => Promise<User | null>;
}

export type { Repository };
