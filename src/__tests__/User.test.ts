import request from "supertest";
import { getConnection } from "typeorm";
import { app } from "../app";

import createConnection from "../database";

describe("Users", () => {
    beforeAll(async () => {
        const connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        const connection = getConnection();
        await connection.dropDatabase();
        await connection.close();
    });

    it("Shoulb be able to create a new user", async () => {
        const response = await request(app).post("/users").send({
            email: "user@example.com",
            name: "User Example",
        });

        expect(response.status).toBe(201);
    });

    it("Should no be able to create a user with with existing email", async () => {
        const response = await request(app).post("/users").send({
            email: "user@example.com",
            name: "User Example",
        });
        expect(response.status).toBe(400);
    });
});
