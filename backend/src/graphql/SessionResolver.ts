import { Resolver, Query, Mutation, Arg, Ctx, ID } from "type-graphql";
import { StudySession } from "../entities";
import { CreateSessionInput } from "./inputs";
import { MyContext } from "./context";
import { mapAppError } from "./errors";
import { AppError } from "../services/DeviceService";

@Resolver(() => StudySession)
export class SessionResolver {
  @Query(() => StudySession, {
    nullable: true,
    description: "Get a study session by ID",
  })
  async session(
    @Arg("id", () => ID) id: string,
    @Ctx() { services }: MyContext
  ): Promise<StudySession | null> {
    try {
      return await services.sessions.getById(id);
    } catch (err) {
      if (err instanceof AppError && err.code === "UNKNOWN_SESSION") {
        return null;
      }
      mapAppError(err);
    }
  }

  @Query(() => [StudySession], { description: "List study sessions" })
  async sessions(@Ctx() { services }: MyContext): Promise<StudySession[]> {
    return services.sessions.list();
  }

  @Mutation(() => StudySession, {
    description: "Create a study session for an anonymized participant",
  })
  async createSession(
    @Arg("input", () => CreateSessionInput) input: CreateSessionInput,
    @Ctx() { services }: MyContext
  ): Promise<StudySession> {
    try {
      return await services.sessions.create(input);
    } catch (err) {
      mapAppError(err);
    }
  }
}
