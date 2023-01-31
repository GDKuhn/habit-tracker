import { prisma } from "./lib/prisma";
import { z } from "zod";
import { FastifyInstance } from "fastify";
import dayjs from "dayjs";

export async function appRoutes(app: FastifyInstance) {
  //* create new habit
  app.post("/habits", async (req) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    });

    const { title, weekDays } = createHabitBody.parse(req.body);

    const today = dayjs().startOf("day").toDate();

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay,
            };
          }),
        },
      },
    });
  });

  //* get possible && completed items of DAY
  app.get("/day", async (req) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    });

    const { date } = getDayParams.parse(req.query);

    const parsedDate = dayjs(date).startOf("day");

    const weekDay = parsedDate.get("day");

    //*possible habits
    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    });

    //*completed habits
    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    });

    const completedHabits = day?.dayHabits.map((dayHabit) => {
      return dayHabit.habit_id;
    });

    return {
      possibleHabits,
      completedHabits,
    };
  });

  //*  toogle completed || uncompelted habit on given DAY
  app.patch("/habits/:id/toggle", async (req) => {
    //route parm(:id) => parametro de identificação

    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    });
    const { id } = toggleHabitParams.parse(req.params);

    const today = dayjs().startOf("day").toDate();

    //prucura o day que bate com o today
    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    });

    //se nao acha um day que bate com o today, cria ele
    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      });
    }

    //agora que day existe por certeza, ver se encontra um dayHabit nesse dia
    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    });

    if (dayHabit) {
      // achando um dayhabit no day = today => remover a marcação de compelo
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      });
    } else {
      //não achando => criar e completa o Habito do dia
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      });
    }
  });

  //* DAY summary
  app.get("/summary", async () => {
    //*return array of objects => [{ date: x, amountOfPossibleHabits: y, completed: z },{...},{...}]
    // Query bem complexa, exige ecrever o SQL na mão (SQL Raw)

    const summary = await prisma.$queryRaw`
    SELECT 
      D.id, 
      D.date,
      (
          SELECT 
           cast (count(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
      ) as completed,
      (
        SELECT
        cast (count(*) as float)
        FROM habit_week_days HWD
        JOIN habits H
          ON H.id = HWD.habit_id
        WHERE 
          HWD.week_day = cast(strftime('%w',D.date/1000.0,'unixepoch')as int)
          AND H.created_at <= D.date 
      ) as amount
    FROM days D
    `;
    return summary;
  });
}
