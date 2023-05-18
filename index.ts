import { APIGatewayProxyEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import * as mysql from 'mysql';

const host = "db-petnmatt.cs0nb5zlvm5n.ap-northeast-2.rds.amazonaws.com";
const user = "admin";
const password = "wnakf0510#";

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    console.log("Event", event);

    interface Response {
        statusCode: number;
        message: string;
    }

    function sendResponse(statusCode: number, message: string): Response {
        return {
            statusCode: statusCode,
            message: message,
        };
    }

    console.log("event", event);

    let tableName = 'users_test';
    if(!event.body){
        console.log("Not exist body");
        return sendResponse(400, 'body is required.');
    };

    const { body, headers, queryStringParameters } = event;
    console.log("headers", headers);
    console.log("queryStringParameters", queryStringParameters);
    console.log("body", body);

    const requestBody = JSON.parse(body);

    let connection, dbConnection;
    try{
        connection = await mysql.createConnection({
            host     : host,
            user     : user,
            password : password,
            port     : 3306
        });

        dbConnection = await connection.connect();
    }catch (e) {
        console.log("Error in db connection", e);
        return sendResponse(400, 'connection error');
    }

    let rows, fields;
    try{
        [rows, fields] = await dbConnection.query(`SELECT COUNT(*) FROM ${tableName} WHERE id = ${requestBody.id}`);
        console.log("rows, fields", rows, fields)
    }catch (e) {
        console.log("Error in db query", e);
        return sendResponse(400, 'query error');
    };

    return sendResponse(200, 'success');
};