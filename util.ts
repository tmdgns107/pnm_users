// export function queryMySQL(connection: any, query: string, values: any): Promise<any> {
//     return new Promise((resolve, reject) => {
//         connection.query(query, values, (error, results) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(results);
//             }
//         });
//     });
// }

export async function queryMySQL(connection: any, query: string, values: any): Promise<any> {
    try {
        const [rows] = await connection.execute(query, values);
        return rows;
    } catch (error) {
        throw error;
    }
}
