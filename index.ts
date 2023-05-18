import { APIGatewayProxyEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import mysql from 'mysql';

const host = "db-petnmatt.cs0nb5zlvm5n.ap-northeast-2.rds.amazonaws.com";
const user = "admin";
const password = "wnakf0510#";

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    console.log("Event", event);

    let response = {
        statusCode: 200,
        body: ''
    };
    let responseBody = {
        message: '',
        userInfo: {}
    }

    console.log("event", event);

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
            host: host,
            user: user,
            password: password,
            port: 3306,
            database: "mydb"
        });

        connection.connect();

        const query = `SELECT COUNT(*) FROM ${tableName} WHERE id = ?`;
        const values = [requestBody.id];

        const results = await new Promise<any[]>((resolve, reject) => {
            connection.query(query, values, (error, results, fields) => {
                if (error) {
                    console.log("Error in db query", error);
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        console.log("results", results);
        response.statusCode = 200;
        responseBody.message = 'success';
        responseBody.userInfo = results;
        response.body = JSON.stringify(responseBody);
        return response;
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
