import { APIGatewayProxyEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import mysql from 'mysql';
import * as database from "./config/database.json";

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    console.log("Event", event);

    let response = {
        statusCode: 200,
        body: ''
    };
    let responseBody = {
        message: '',
        userInfo: {}
    };

    let tableName = 'users_test';
    if (!event.body) {
        console.log("Not exist body");
        response.statusCode = 400;
        responseBody.message = 'body is required.';
        response.body = JSON.stringify(responseBody);
        return response;
    };

    const { body, headers, queryStringParameters } = event;
    console.log("headers", headers);
    console.log("queryStringParameters", queryStringParameters);
    console.log("body", body);

    const requestBody = JSON.parse(body);

    let connection;
    try {
        connection = mysql.createConnection({
            host: database.host,
            user: database.user,
            password: database.password,
            port: database.port,
            database: database.database
        });

        connection.connect();

        const selectQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE id = ?`;
        const selectValues = [requestBody.id];

        const selectResults = await new Promise<any[]>((resolve, reject) => {
            connection.query(selectQuery, selectValues, (error, results) => {
                if (error) {
                    console.log("Error in db query", error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        console.log("selectResults", selectResults);

        if (selectResults[0].count > 0) {
            const selectUserQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
            const selectUserValues = [requestBody.id];

            const selectUserResults = await new Promise<any[]>((resolve, reject) => {
                connection.query(selectUserQuery, selectUserValues, (error, results) => {
                    if (error) {
                        console.log("Error in db query", error);
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            console.log("selectUserResults", selectUserResults);
            response.statusCode = 200;
            responseBody.message = 'success';
            responseBody.userInfo = selectUserResults;
            response.body = JSON.stringify(responseBody);
            return response;
        } else {
            const updateTime = new Date().toISOString();
            const insertQuery = `INSERT INTO ${tableName} (id, updateTime) VALUES (?, ?)`;
            const insertValues = [requestBody.id, updateTime];

            await new Promise<void>((resolve, reject) => {
                connection.query(insertQuery, insertValues, (error) => {
                    if (error) {
                        console.log("Error in db query", error);
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            response.statusCode = 200;
            responseBody.message = 'success';
            responseBody.userInfo = { id: requestBody.id, updateTime: updateTime };
            response.body = JSON.stringify(responseBody);
            return response;
        }
    } catch (e) {
        console.log("Error in db connection", e);
        response.statusCode = 400;
        responseBody.message = 'error in query';
        responseBody.userInfo = {};
        response.body = JSON.stringify(responseBody);
        return response;
    } finally {
        if (connection) {
            connection.end();
        }
    }
};
