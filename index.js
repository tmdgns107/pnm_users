// import AWS from 'aws-sdk';
import * as dbConfig from './config/database.json' assert { type: 'json' };
import mysql from 'mysql2';

export default async (event) => {
    console.log("event", event);

    let tableName = 'users_test';
    if(!event.body){
        console.log("Not exist body");
        return sendResponse(400, {message: 'body is required.'});
    };

    const { body, headers, queryStringParameters } = event;
    console.log("headers", headers);
    console.log("queryStringParameters", queryStringParameters);
    console.log("body", body);

    let connection, dbConnection;
    try{
        connection = await mysql.createConnection({
            host     : dbConfig.host,
            user     : dbConfig.user,
            password : dbConfig.password,
            port     : dbConfig.port
        });

        dbConnection = await connection.connect();
    }catch (e) {
        console.log("Error in db connection", e);
        return sendResponse(400, {message: 'An error occurred while connecting to the DB.'});
    };

    let rows, fields;
    try{
        [rows, fields] = await dbConnection.query(`SELECT COUNT(*) FROM ${tableName}`);
        console.log("rows, fields", rows, fields)
    }catch (e) {
        console.log("Error in db query", e);
    }

    function sendResponse(statusCode, responseBody) {
        console.log("responseBody", responseBody);
        return {
            "statusCode": statusCode,
            "headers": {
                "Access-Control-Allow-Origin": '*',
                "Access-Control-Allow-Headers": "*"
            },
            "body": JSON.stringify(responseBody),
            "isBase64Encoded": false
        }
    }
};