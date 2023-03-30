#!/bin/sh

cd /home/ubuntu/dm2023-nest || exit

EXIST_PROXY=$(sudo docker-compose -p proxy -f docker-compose.proxy.yml ps | grep running)

if [ -z "$EXIST_PROXY" ]; then
    echo "> Proxy Container is not existed"
    sudo docker-compose -p proxy -f docker-compose.proxy.yml up -d
fi

DOCKER_APP_NAME=dm2023-nest
EXIST_GREEN=$(sudo docker-compose -p ${DOCKER_APP_NAME}-green -f docker-compose.green.yml ps | grep running)

# 이번 배포에서 켜질 포트 번호 변수 선언
TARGET_PORT=0

# 이번 배포에서 꺼질 컨테이너 색상 변수 선언
TARGET_COLOR=""

if [ -z "$EXIST_GREEN" ]; then
    echo "> Start Green Container..."
    TARGET_PORT=3001
    TARGET_COLOR="blue"
    sudo docker-compose -p ${DOCKER_APP_NAME}-green -f docker-compose.green.yml up -d
else
    echo "> Start Blue Container..."
    TARGET_PORT=3002
    TARGET_COLOR="green"
    sudo docker-compose -p ${DOCKER_APP_NAME}-blue -f docker-compose.blue.yml up -d
fi

echo "> Start health check of Nest App at 'http://localhost:${TARGET_PORT}'..."

for RETRY_COUNT in $(seq 1 10)
do
    echo "> Retrying... (${RETRY_COUNT})"

    RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${TARGET_PORT}/api/health/http)

    if [ "${RESPONSE_CODE}" -eq 200 ]; then
        echo "> New Nest App successfully running"
        echo "> Close Old Nest App"
        sudo docker-compose -p ${DOCKER_APP_NAME}-${TARGET_COLOR} -f docker-compose.${TARGET_COLOR}.yml down
        break

    elif [ "${RETRY_COUNT}" -eq 10 ]; then
        echo "> Health check failed."
        exit 1
    fi
    sleep 10
done


echo "Prune Docker System"
sudo docker system prune -af

exit 0