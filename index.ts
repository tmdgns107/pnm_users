import { APIGatewayProxyEvent, APIGatewayProxyResultV2, Handler } from 'aws-lambda';
import mysql from 'mysql2/promise';
import * as util from "./util";

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResultV2> => {
    console.log("Event", event);

    let alias: string = 'dev';
    let tableName: string = 'users_test';
    if(event.requestContext.path.includes('/prod/') || event.requestContext.path.includes('/live/')) {
        alias = 'prod';
        tableName = 'users';
    };

    let response: APIGatewayProxyResultV2 = {
        statusCode: 200,
        headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': true},
        body: ''
    };
    let responseBody: { message: string; userInfo: object };
    responseBody = {
        message: '',
        userInfo: {}
    };

    // body가 입력되지 않았을 경우에는 오류 전달.
    if (!event.body) {
        console.log("Not exist body");
        response.statusCode = 400;
        responseBody.message = 'body is required.';
        response.body = JSON.stringify(responseBody);
        return response;
    }

    const { body } = event;
    const requestBody = JSON.parse(body);
    console.log("requestBody", requestBody);

    /** 필요한 key 검증 **/
    // let requiredKey: string[] = ['id', 'email', 'accessToken', 'image', 'provider'];
    let requiredKey: string[] = ['id', 'email', 'provider'];
    for(let key of requiredKey){
        if (!(key in requestBody)) {
            console.log(`Not exist ${key}`);
            response.statusCode = 400;
            response.body = JSON.stringify({ message: `${key} is required.` });
            return response;
        }
    }

    let connection;
    try {
        /** MySQL 연결 **/
        connection = await mysql.createConnection({
            host: process.env[`${alias.toUpperCase()}_DB_HOST`],
            user: process.env[`${alias.toUpperCase()}_DB_USER`],
            password: process.env[`${alias.toUpperCase()}_DB_PASSWORD`],
            port: 3306,
            database: process.env[`${alias.toUpperCase()}_DB_NAME`]
        });

        /** body의 id값으로 table 조회 후 값이 존재여부 확인 **/
        const query: string = `SELECT COUNT(*) AS count FROM ${tableName} WHERE id = ?`;
        const values: any[] = [requestBody.id];

        const results = await util.queryMySQL(connection, query, values);

        console.log("results", results);
        const count: number = results[0]?.count || 0;
        const currentTime: string = new Date().toISOString();

        if (count >= 1) {
            /** 만약 id가 존재한다면 updateTime을 renew **/
            const updateQuery: string = `UPDATE ${tableName} SET updateTime = '${currentTime}' WHERE id = ?`;
            await util.queryMySQL(connection, updateQuery, values);

            response.statusCode = 200;
            responseBody.message = 'success';
            responseBody.userInfo = results[0];
            response.body = JSON.stringify(responseBody);
        } else {
            /** 만약 id가 존재하지 않는다면 body.id의 값으로 새로운 데이터 생성 후 값을 전달 **/
            const columns: string = Object.keys(requestBody).join(', ');
            const valuePlaceholders: string = Object.values(requestBody).map(() => '?').join(', ');
            const insertQuery: string = `INSERT INTO ${tableName} (${columns}, createTime, updateTime) VALUES (${valuePlaceholders}, '${currentTime}', '${currentTime}')`;
            await util.queryMySQL(connection, insertQuery, Object.values(requestBody));

            response.statusCode = 200;
            responseBody.message = 'success';
            responseBody.userInfo = { ...{ updateTime: currentTime, createTime: currentTime }, ...requestBody };
            response.body = JSON.stringify(responseBody);
        }

        return response;
    } catch (e) {
        console.log("Error in db connection", e);
        response.statusCode = 400;
        responseBody.message = 'An error occurred while executing the query.';
        responseBody.userInfo = {};
        response.body = JSON.stringify(responseBody);
        return response;
    } finally {
        if (connection) {
            connection.end();
        }
    }
};
