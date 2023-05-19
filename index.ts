import { APIGatewayProxyEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import mysql from 'mysql';
import * as database from "./config/database.json";
import * as util from "./util";

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    console.log("Event", event);

    let response: APIGatewayProxyResultV2 = {
        statusCode: 200,
        body: ''
    };
    let responseBody = {
        message: '',
        userInfo: {}
    };

    let tableName :string = 'users_test';
    if (!event.body) {
        console.log("Not exist body");
        response.statusCode = 400;
        responseBody.message = 'body is required.';
        response.body = JSON.stringify(responseBody);
        return response;
    }

    const { body, headers, queryStringParameters } = event;
    const requestBody = JSON.parse(body);
    console.log("requestBody", requestBody);

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

        const query :string = `SELECT COUNT(*) AS count FROM ${tableName} WHERE id = ?`;
        const values :any[] = [requestBody.id];

        // const results = await new Promise<any>((resolve, reject) => {
        //     connection.query(query, values, (error, results) => {
        //         if (error) {
        //             console.log("Error in db query", error);
        //             reject(error);
        //         } else {
        //             resolve(results);
        //         }
        //     });
        // });
        const results = await util.queryMySQL(connection, query, values);

        console.log("results", results);
        const count :number = results[0]?.count || 0;

        const currentTime :string = new Date().toISOString();
        if (count >= 1) {
            const updateQuery: string = `UPDATE ${tableName} SET updateTime = '${currentTime}' WHERE id = ?`;
            // await new Promise<void>((resolve, reject) => {
            //     connection.query(updateQuery, values, (error) => {
            //         if (error) {
            //             console.log("Error in db update", error);
            //             reject(error);
            //         } else {
            //             resolve();
            //         }
            //     });
            // });
            await util.queryMySQL(connection, updateQuery, values);

            response.statusCode = 200;
            responseBody.message = 'success';
            responseBody.userInfo = results[0];
            response.body = JSON.stringify(responseBody);
        } else {
            const columns: string = Object.keys(requestBody).join(', ');
            const values: string = Object.values(requestBody).map((value) :string => `'${value}'`).join(', ');

            const insertQuery :string = `INSERT INTO ${tableName} (${columns}, createTime, updateTime) VALUES (${values}, '${currentTime}', '${currentTime}')`;
            // await new Promise<void>((resolve, reject) => {
            //     connection.query(insertQuery, values, (error) => {
            //         if (error) {
            //             console.log("Error in db insert", error);
            //             reject(error);
            //         } else {
            //             resolve();
            //         }
            //     });
            // });
            await util.queryMySQL(connection, insertQuery, values);

            response.statusCode = 200;
            responseBody.message = 'success';
            responseBody.userInfo = {...{updateTime: currentTime, createTime: currentTime}, ...requestBody};
            response.body = JSON.stringify(responseBody);
        }

        return response;
    } catch (e) {
        console.log("Error in db connection", e);
        response.statusCode = 400;
        responseBody.message = 'An error occurred while executing query.';
        responseBody.userInfo = {};
        response.body = JSON.stringify(responseBody);
        return response;
    } finally {
        if (connection) {
            connection.end();
        }
    }
};
