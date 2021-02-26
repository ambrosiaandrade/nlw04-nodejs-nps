import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UserRepository";
import * as yup from "yup";
import { AppError } from "../errors/AppError";

class UserController {
    async create(request: Request, response: Response) {
        // const body = request.body;
        const { name, email } = request.body;

        // Dizendo o que quer validar com o YUP
        const schema = yup.object().shape({
            name: yup.string().required(), // Você pode colocar uma mensagem dentro do required -> "Precisa ter um nome"
            email: yup.string().email().required(),
        });

        // Fazendo a validação com o YUP
        // Maneira 1
        // if (!(await schema.isValid(request.body))) {
        //     return response.status(400).json({ error: "Validation Failed!" });
        // }

        // Maneira 2, consegue ter um controle melhor sobre os erros
        try {
            await schema.validate(request.body, { abortEarly: false });
        } catch (err) {
            throw new AppError(err);
            // Abaixo era o código sem ter a classe AppError para tratar os nossos erros
            // return response.status(400).json({ error: err });
        }

        const usersRepository = getCustomRepository(UsersRepository);

        // SELECT * FROM USERS WHERE EMAIL = "EMAIL" isso tudo foi substituido por findOne
        const userAlreadyExists = await usersRepository.findOne({
            email,
        });

        if (userAlreadyExists) {
            throw new AppError("User already exists!");
            // Abaixo era o código sem ter a classe AppError para tratar os nossos erros
            // return response.status(400).json({
            //     error: "User already exists!",
            // });
        }

        const user = usersRepository.create({
            name,
            email,
        });

        await usersRepository.save(user);

        return response.status(201).json(user);
    }
}

export { UserController };
