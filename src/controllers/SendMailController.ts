import { Request, Response } from "express";
import { resolve } from "path";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UserRepository";
import SendMailService from "../services/SendMailService";

class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(
            SurveysUsersRepository
        );

        const user = await usersRepository.findOne({ email });

        if (!user) {
            throw new AppError("User does not exists");
            // Abaixo era o código sem ter a classe AppError para tratar os nossos erros
            // return response.status(400).json({
            //     error: "User does not exists",
            // });
        }

        const survey = await surveysRepository.findOne({
            id: survey_id,
        });

        if (!survey) {
            throw new AppError("Survey does not exists!");
            // Abaixo era o código sem ter a classe AppError para tratar os nossos erros
            // return response.status(400).json({
            //     error: "Survey does not exists!",
            // });
        }

        const npsPath = resolve(
            __dirname,
            "..",
            "views",
            "emails",
            "npsMail.hbs"
        );

        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            // where: [{ user_id: user.id }, { value: null }], // Aqui está como OR então nunca tem uma nova pesquisa
            where: { user_id: user.id, value: null }, // Aqui está como AND
            relations: ["user", "survey"],
        });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "", // Deixando vazio pois pode não existir ainda uma pesquisa
            link: process.env.URL_MAIL,
        };

        if (surveyUserAlreadyExists) {
            (variables.id = surveyUserAlreadyExists.id), // Prettier colocou parênteses
                // Se existir serveyUser coloca o id na variável vazia
                await SendMailService.execute(
                    email,
                    survey.title,
                    variables,
                    npsPath
                );
            return response.json(surveyUserAlreadyExists);
        }

        // Salvar as informações na tabela surveyUser
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id,
        });

        await surveysUsersRepository.save(surveyUser);
        // Enviar e-mail para o usuário
        variables.id = surveyUser.id;
        // Se não existir o serveyUser, coloca o id com o que foi acabado de criar
        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);
    }
}

export { SendMailController };
