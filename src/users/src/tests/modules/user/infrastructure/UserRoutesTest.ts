/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Server } from "http";
import { NextFunction } from "express";
import supertest from "supertest";
import sinon, { SinonSandbox } from "sinon";
import { expect } from "chai";
import httpStatus from "http-status";

import App from "@app/app";
import fileUploaderMiddleware, { MulterRequest } from "@shared/middlewares/fileUploaderMiddleware";
import UserNotFoundError from "@user/application/error/UserNotFoundError";
import UserService from "@user/domain/UserService";
import RoutineService from "@user/domain/RoutineService";
import UserRoutes from "@user/application/routes/v1/UserRoutes";
import TestRequest from "../../../shared/utils/requests";

describe("UserRoutes", () => {
    let userService: UserService;
    let routineService: RoutineService;
    let server: Server;
    let api: TestRequest;
    let sandbox: SinonSandbox;

    let path: string;

    beforeEach(async () => {
        userService = <UserService>{};
        const controller = new UserRoutes(userService, routineService);
        const middlewares = [];
        path = controller.path;
        const app = new App([controller], middlewares);

        await app.init();
        server = await app.listen(false);
        const testApi = supertest(server);
        api = new TestRequest(testApi);

        sandbox = sinon.createSandbox();
        sandbox.stub(fileUploaderMiddleware, "fileUpload").callsFake((): any => {
            return {
                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions, id-denylist
                any() {
                    return (req: MulterRequest, res: Response, next: NextFunction) => {
                        req.files = [{ location: "images", key: "foo-" }];
                        next();
                    };
                },
            };
        });
    });

    afterEach(() => {
        sandbox.restore();
        server.close();
    });

    it("deleteUserId should return false and 422 if id is not uuid", async () => {
        // Given
        const userId = "foo";

        // When
        const response = await api.delete(`${path}/${userId}`);

        // Then
        const { body, statusCode } = response;
        const { success, errors } = body;

        expect(success).to.be.false;
        expect(statusCode).to.be.equal(httpStatus.UNPROCESSABLE_ENTITY);
        expect(errors).to.be.not.undefined;
    });

    it("deleteUserId should return false and 401 if user is not admin", async () => {
        // Given
        const userId = "7e20b2c1-e95d-4e12-9125-cdd6c8cbd356";

        userService.isAdmin = async (_: string): Promise<boolean> => {
            return false;
        };

        // When
        const response = await api.delete(`${path}/${userId}`);

        // Then
        const { body, statusCode } = response;
        const { success, errors } = body;

        expect(success).to.be.false;
        expect(statusCode).to.be.equal(httpStatus.UNAUTHORIZED);
        expect(errors).to.be.not.undefined;
    });

    it("deleteUserId should return false and 404 if user is admin but user to delete is not found", async () => {
        // Given
        const userId = "7e20b2c1-e95d-4e12-9125-cdd6c8cbd356";

        userService.isAdmin = async (_: string): Promise<boolean> => {
            return true;
        };

        userService.deleteUserById = async (_: string): Promise<void> => {
            throw new UserNotFoundError();
        };

        // When
        const response = await api.delete(`${path}/${userId}`);

        // Then
        const { body, statusCode } = response;
        const { success, errors } = body;

        expect(success).to.be.false;
        expect(statusCode).to.be.equal(httpStatus.NOT_FOUND);
        expect(errors).to.be.not.undefined;
    });

    it("deleteUserId should return true and 200 if user is admin and user to delete is found", async () => {
        // Given
        const userId = "7e20b2c1-e95d-4e12-9125-cdd6c8cbd356";

        userService.isAdmin = async (_: string): Promise<boolean> => {
            return true;
        };

        userService.deleteUserById = async (_: string): Promise<void> => {
            return;
        };

        // When
        const response = await api.delete(`${path}/${userId}`);

        // Then
        const { body, statusCode } = response;
        const { success, errors } = body;

        expect(success).to.be.true;
        expect(statusCode).to.be.equal(httpStatus.OK);
        expect(errors).to.be.undefined;
    });
});
