import { Resolver, Query, Mutation, Arg, Ctx, ID } from "type-graphql";
import { Device } from "../entities";
import { RegisterDeviceInput } from "./inputs";
import { MyContext } from "./context";
import { mapAppError } from "./errors";
import { AppError } from "../services/DeviceService";

@Resolver(() => Device)
export class DeviceResolver {
  @Query(() => String, { description: "API health check" })
  health(): string {
    return "ok";
  }

  @Query(() => Device, {
    nullable: true,
    description: "Get a registered device by ID",
  })
  async device(
    @Arg("id", () => ID) id: string,
    @Ctx() { services }: MyContext
  ): Promise<Device | null> {
    try {
      return await services.devices.getById(id);
    } catch (err) {
      if (err instanceof AppError && err.code === "UNKNOWN_DEVICE") {
        return null;
      }
      mapAppError(err);
    }
  }

  @Query(() => [Device], { description: "List registered devices" })
  async devices(@Ctx() { services }: MyContext): Promise<Device[]> {
    return services.devices.list();
  }

  @Mutation(() => Device, { description: "Register a smart ring device" })
  async registerDevice(
    @Arg("input", () => RegisterDeviceInput) input: RegisterDeviceInput,
    @Ctx() { services }: MyContext
  ): Promise<Device> {
    try {
      return await services.devices.register(input);
    } catch (err) {
      mapAppError(err);
    }
  }
}
