/* eslint-disable @typescript-eslint/require-await */
import { expect } from "chai";

import NotFoundError from "@shared/error/BaseNotFoundError";
import NotAllowedError from "@shared/error/BaseNotAllowedError";
import DeleteUserByIdInteractor, { DeleteUserByIdData } from "@user/application/interactors/DeleteUserByIdInteractor";
import UserService from "@user/domain/UserService";
import UserNotFoundError from "@user/application/error/UserNotFoundError";

describe("DeleteUserByIdInteractor", () => {
    let service: UserService;
    let interactor: DeleteUserByIdInteractor;

    beforeEach(() => {
        service = <UserService>{};
        interactor = new DeleteUserByIdInteractor(service);
    });

    it("deleteUserById should throw NotAllowError if user is not admin", async () => {
        // Given
        service.isAdmin = async (_: string): Promise<boolean> => {
            return false;
        };

        const inputData: DeleteUserByIdData = { userId: "foo", userToDelete: "bar" };

        try {
            // When
            await interactor.execute(inputData);
        } catch (error: any) {
            // Then
            expect(error).instanceOf(NotAllowedError);
        }
    });

    it("deleteUserById should throw NotFoundError if user is admin but user to delete is not found", async () => {
        // Given
        service.isAdmin = async (_: string): Promise<boolean> => {
            return true;
        };

        service.deleteUserById = async (_: string): Promise<void> => {
            throw new UserNotFoundError();
        };

        const inputData: DeleteUserByIdData = { userId: "foo", userToDelete: "bar" };

        try {
            // When
            await interactor.execute(inputData);
        } catch (error: any) {
            // Then
            expect(error).instanceOf(NotFoundError);
        }
    });

    it("deleteUserById should return without any error if user is admin and user to delete is found", async () => {
        // Given
        service.isAdmin = async (_: string): Promise<boolean> => {
            return true;
        };

        const errorMessage = "foo";
        service.deleteUserById = async (_: string): Promise<void> => {
            return;
        };

        const inputData: DeleteUserByIdData = { userId: "foo", userToDelete: "bar" };

        // When
        await interactor.execute(inputData);

        // Then
    });
});
