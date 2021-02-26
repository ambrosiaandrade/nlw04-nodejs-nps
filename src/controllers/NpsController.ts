import { Request, Response } from "express";
import { getCustomRepository, Not, IsNull } from "typeorm";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

class NpsController {
    async execute(request: Request, response: Response) {
        const { survey_id } = request.params;

        const surveysUsersRepository = getCustomRepository(
            SurveysUsersRepository
        );

        const surveysUsers = await surveysUsersRepository.find({
            survey_id,
            value: Not(IsNull()),
        });

        const detractor = surveysUsers.filter(
            (survey) =>
                // Esses são os detratores, que deram a nota 0 a 6
                survey.value >= 0 && survey.value <= 6
        ).length;

        const promoters = surveysUsers.filter(
            (survey) =>
                // Esses são os promotores, que deram a nota 9 e 10
                survey.value >= 9 && survey.value <= 10
        ).length;

        const passivos = surveysUsers.filter(
            (survey) =>
                // Esses são os passivos, não entram no cálculo do NPS, deram a nota 7 e 8
                survey.value >= 7 && survey.value <= 8
        ).length;

        const totalAnswers = surveysUsers.length;

        // OBS: Depois do filter foi utilizado o length pq o filter retorna um array, e nós queremos a qtd

        const calculate = Number(
            (((promoters - detractor) / totalAnswers) * 100).toFixed(2)
        );
        // O .toFixed vai deixar 2 casas decimais porém retorna uma string, por isso o Number() para fazer virar número

        return response.json({
            detractor,
            promoters,
            passivos,
            totalAnswers,
            nps: calculate,
        });
    }
}

export { NpsController };
