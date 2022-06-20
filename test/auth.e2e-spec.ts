import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('handles a signup request', () => {
        const EMAIL = 'ashl3e@fsd.com';
        return request(app.getHttpServer())
            .post('/auth/signup')
            .send({
                email: EMAIL,
                password: 'fsalfdkl'
            })
            .expect(201)
            .then((res) => {
                const { id, email } = res.body;
                expect(id).toBeDefined();
                expect(email).toEqual(EMAIL);
            });
    });

    it('signup as a new user then get the currently logged in user', async () => {
        const EMAIL = 'ahfds@fasd.com';

        const res = await request(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: EMAIL, password: 'afds' })
            .expect(201);

        const cookie = res.get('Set-Cookie');

        const { body } = await request(app.getHttpServer())
            .get('/auth/whoami')
            .set('Cookie', cookie)
            .expect(200);

        expect(body.email).toEqual(EMAIL);

    });

});
