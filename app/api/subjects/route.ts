import { apiHandler, dataResponse } from "@/lib/api";
import { listSubjects } from "@/lib/tutors";

export const GET = apiHandler(async () => dataResponse({ subjects: await listSubjects() }));
