import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createGoal, listCurriculum, listTutorStudents } from "@/lib/curriculum";
import { listSubjects } from "@/lib/tutors";
import { curriculumGoalSchema } from "@/lib/validation";

export const GET = apiHandler(async (request) => {
  const user = await requireUser(request);
  return dataResponse({
    goals: await listCurriculum(user),
    students: user.role === "tutor" || user.role === "admin" ? await listTutorStudents(user) : [],
    subjects: await listSubjects(),
  });
});

export const POST = apiHandler(async (request) => {
  const user = await requireUser(request, ["tutor"]);
  return dataResponse(
    { goal: await createGoal(user, await parseJson(request, curriculumGoalSchema)) },
    201,
  );
});
