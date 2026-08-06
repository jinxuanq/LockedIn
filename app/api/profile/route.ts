import { apiHandler, dataResponse, parseJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import {
  getProfile,
  listSubjects,
  updateStudentProfile,
  updateTutorProfile,
} from "@/lib/tutors";
import { studentProfileSchema, tutorProfileSchema } from "@/lib/validation";

export const GET = apiHandler(async (request) => {
  const user = await requireUser(request);
  return dataResponse({ profile: await getProfile(user), subjects: await listSubjects() });
});

export const PUT = apiHandler(async (request) => {
  const user = await requireUser(request, ["student", "tutor"]);
  if (user.role === "student") {
    await updateStudentProfile(user, await parseJson(request, studentProfileSchema));
  } else {
    await updateTutorProfile(user, await parseJson(request, tutorProfileSchema));
  }
  return dataResponse({ profile: await getProfile(user), subjects: await listSubjects() });
});
