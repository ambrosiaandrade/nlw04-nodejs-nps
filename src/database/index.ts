import { Connection, createConnection, getConnectionOptions } from "typeorm";

export default async (): Promise<Connection> => {
    const defaultOptions = await getConnectionOptions();
    // Vamos perguntar se é ambiente de teste, se for, use tal banco...
    return createConnection(
        Object.assign(defaultOptions, {
            database:
                process.env.NODE_ENV === "test"
                    ? "./src/database/database.test.sqlite"
                    : defaultOptions.database,
        })
    );
};
