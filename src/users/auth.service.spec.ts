import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

describe('AuthService', () => {

    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {

        const users: User[] = [];

        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email);
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = { id: Math.floor(Math.random() * 999999), email, password } as User;
                users.push(user);
                return Promise.resolve(user);
            }
        };

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ]
        }).compile();

        service = module.get(AuthService);
    });

    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with a salted and hashed password', async () => {
        const user = await service.signUp('email@email.com', 'password1234');

        expect(user.password).not.toEqual('password1234');
        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that in use', async () => {
        await service.signUp('email@email.com', 'password');
        await expect(service.signUp('email@email.com', 'password')).rejects.toThrow(BadRequestException);
    });

    it('throws an error if signIn is called with an unused email', async () => {
        await expect(service.signIn('email@email.com', 'password')).rejects.toThrow(NotFoundException);
    });

    it('throw an error if an invalid password is provided', async () => {
        await service.signUp('email1@email.com', 'password')
        await expect(service.signIn('email1@email.com', 'password1')).rejects.toThrow(BadRequestException);
    });

    it('returns a user if correct password is provided', async () => {
        await service.signUp('hello@email.com', 'helloPassword');

        const user = await service.signIn('hello@email.com', 'helloPassword');
        expect(user).toBeDefined();
    });

});