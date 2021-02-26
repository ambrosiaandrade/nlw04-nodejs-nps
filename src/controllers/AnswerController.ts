import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { AppError } from "../errors/AppError";

class AnswerController {
    // http://localhost:3333/answers/1?u=a3198f7e-0392-4477-8008-dfb32c76af88

    async execute(request: Request, response: Response) {
        // Recebendo os parâmetros da nossa rota
        const { value } = request.params;
        const { u } = request.query;
        // prettier-ignore
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        // Buscando dentro do repositório se existe
        const surveyUser = await surveysUsersRepository.findOne({
            id: String(u),
        });

        // Se não existe dará a mensagem de erro
        if (!surveyUser) {
            throw new AppError("Survey User does not exists!");
            // Abaixo era o código sem ter a classe AppError para tratar os nossos erros
            // return response.status(400).json({
            //     error: "Survey User does not exists!",
            // });
        }

        // Se existir sobrescreve o valor significando que o usuário respondeu
        surveyUser.value = Number(value);

        await surveysUsersRepository.save(surveyUser);

        return response.json(surveyUser);
    }
}

export { AnswerController };
