# pnm_users

이 소스 코드는 AWS Lambda 함수로 작성된 API 핸들러입니다. 해당 핸들러는 AWS Lambda와 함께 사용하여 API Gateway와 통합할 수 있습니다. 이 핸들러는 MySQL 데이터베이스와 상호 작용하여 요청에 따라 데이터를 조회하거나 생성합니다.

[사용 방법]

AWS Lambda 함수를 생성하고 핸들러로 이 코드를 사용하세요.
필요한 경우 환경 변수를 설정하세요. Lambda 함수의 환경 변수로 다음 값을 설정해야 합니다:
DEV_DB_HOST: 개발 환경에서 사용할 MySQL 데이터베이스 호스트
DEV_DB_USER: 개발 환경에서 사용할 MySQL 데이터베이스 사용자 이름
DEV_DB_PASSWORD: 개발 환경에서 사용할 MySQL 데이터베이스 암호
DEV_DB_NAME: 개발 환경에서 사용할 MySQL 데이터베이스 이름
PROD_DB_HOST: 운영 환경에서 사용할 MySQL 데이터베이스 호스트
PROD_DB_USER: 운영 환경에서 사용할 MySQL 데이터베이스 사용자 이름
PROD_DB_PASSWORD: 운영 환경에서 사용할 MySQL 데이터베이스 암호
PROD_DB_NAME: 운영 환경에서 사용할 MySQL 데이터베이스 이름
Lambda 함수와 API Gateway를 통합하여 API 엔드포인트를 생성하세요.
[기타 정보]

handler 함수는 APIGatewayProxyEvent를 받아들이고 APIGatewayProxyResultV2를 반환합니다.
코드에서는 mysql2/promise 패키지를 사용하여 MySQL 데이터베이스와 비동기적으로 상호 작용합니다.
util 모듈에는 MySQL 쿼리를 실행하는 함수가 포함되어 있습니다.
요청 본문이 없거나 잘못된 경우에는 오류 응답이 반환됩니다.
요청에 따라 MySQL 데이터베이스에서 데이터를 조회하고 생성합니다.
환경 변수에 따라 개발 환경과 운영 환경에서 서로 다른 MySQL 데이터베이스에 연결됩니다.
