// import AWS from 'aws-sdk';
// import * as dbConfig from './config/database.json' assert { type: 'json' };
import mysql from 'mysql2';

const host = "db-petnmatt.cs0nb5zlvm5n.ap-northeast-2.rds.amazonaws.com";
const user = "admin";
const password = "wnakf0510#";

// Lambda handler function
export const handler = async (event) => {
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
            host     : host,
            user     : user,
            password : password,
            port     : 3306
        });

        dbConnection = await connection.connect();
    }catch (e) {
        console.log("Error in db connection", e);
        return sendResponse(400, {message: 'An error occurred while connecting to the DB.'});
    }

    let rows, fields;
    try{
        [rows, fields] = await dbConnection.query(`SELECT COUNT(*) FROM ${tableName}`);
        console.log("rows, fields", rows, fields)
    }catch (e) {
        console.log("Error in db query", e);
    }

    return sendResponse(200, {message: 'success'});

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
