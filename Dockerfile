# Node.js 18.12.1 버전을 기반으로 새로운 이미지를 빌드합니다.
FROM node:18.12.1
# 컨테이너 내부의 기본 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app
# 현재 디렉토리의 package.json 및 package-lock.json 파일을 /usr/src/app 디렉토리로 복사합니다.
COPY package*.json ./
# npm ci 명령어를 사용하여 프로덕션 환경에서 필요한 패키지만 설치합니다.
RUN npm ci --only=production
# .dockerignore 파일에서 제외된 파일 외 모든 파일을 /usr/src/app 디렉토리로 복사합니다.
COPY . .
# 컨테이너에서 사용할 포트 번호를 지정합니다.
EXPOSE 3000
#  컨테이너가 실행될 때 실행할 명령어를 지정합니다. npm run start:prod 명령어를 사용하여 애플리케이션을 실행합니다.
CMD ["npm", "run", "start:prod"]