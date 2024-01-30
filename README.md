# Father Gallery
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

<p align="center">
Nest.js로 개발한 Backend 프로젝트 입니다.<br>


<br>
</p>
<p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
</p>

## 구현 된 기능
- 게시글을 위한 기본적인 CRUD 기능을 구현하였습니다.<br>
- TypeORM을 이용하여 Postgres DB와 연동되고 있습니다.<br>
- Cloudflare Image를 위한 API를 구현하였습니다.<br>
- JWT를 이용하여 Access Token, Refresh Token를 이용하여 인증을 구현 하였습니다.<br>
- Test의 경우 Unit Test는 Jest, E2E Test는 Supertest를 사용하여 작성되었습니다.


## 설명
아버지의 그림 작품들을 전시하는 사이트 위한 벡엔드 입니다.<br>
차후 실제 서비스를 할 예정입니다.<br>
현재는 개발을 위한 테스트용으로 사용하고 있습니다.<br>
개인 프로젝트이지만 코드 작성의 맥락은 협업을 전제로 하여 작성하였습니다.<br>
협업의 기준은 프론트엔드, 벡엔드 추가 인원이 참여하였을 시, 이 프로젝트의 맥락을 쉽게 이해하여 투입 될 수 있는가 입니다.<br>

## 차후 진행할 작업
- [ ] AWS Lightsail을 이용한 배포
- [ ] CI/CD 구축
- [ ] (option) Swagger를 이용한 API 문서화
- [ ] (option) 차후 프론트엔드 작성 후 Mono Repo로 변경

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## License

Nest is [MIT licensed](LICENSE).
