# pnm_users

# Lambda Function for MySQL Database Interaction
This repository contains a Lambda function written in TypeScript that interacts with a MySQL database. The function can be deployed in an AWS Lambda environment and integrated with API Gateway to handle database operations through HTTP requests.

Prerequisites
Before running this Lambda function, make sure you have the following:

An AWS account with AWS credentials set up
A running MySQL database instance
Node.js and npm installed on your local development machine


2. Install the dependencies:

cd pnm_users
npm install


3. Configure the MySQL database connection:

- Replace the database connection details in the index.ts file with the appropriate environment variables.

Set the following environment variables for your Lambda function:

- DB_HOST: The host address of the MySQL database
- DB_USER: The username for accessing the MySQL database
- DB_PASSWORD: The password for the MySQL database
- DB_NAME: The name of the MySQL database

4. Deploy the Lambda function:

- Set up your AWS credentials either by configuring the AWS CLI or using environment variables.
- Build the TypeScript code:

  ```
  npx ncc build index.ts
  ```

- Create a deployment package:

  ```
  zip -r lambda.zip dist/ node_modules/ config/
  ```

- Deploy the Lambda function using the AWS CLI:

  ```
  aws lambda create-function --function-name your-function-name --runtime nodejs16.x --role your-role-arn --handler index.handler --zip-file fileb://lambda.zip
  ```

## Usage

This Lambda function is designed to handle API Gateway events. When an API Gateway event triggers the Lambda function, it performs the following steps:

1. Parses the API Gateway event and extracts the request body.
2. Connects to the MySQL database using the provided credentials.
3. Executes a SELECT query to check if a record with the given ID already exists.
4. Based on the query result, either updates the existing record or inserts a new record into the database.
5. Returns a response indicating the success or failure of the operation.

To use this Lambda function:

1. Set up an API Gateway and configure it to trigger the Lambda function.
2. Make HTTP requests to the API Gateway endpoint, providing the necessary request data in the body.
3. The Lambda function will handle the requests, interact with the MySQL database, and return the appropriate response.

For more details on the implementation, refer to the code and comments in the `index.ts` file.

