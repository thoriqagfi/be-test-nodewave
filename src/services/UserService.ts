import { INTERNAL_SERVER_ERROR_SERVICE_RESPONSE, ServiceResponse } from "$entities/Service";
import Logger from "$pkg/logger";
import { prisma } from "$utils/prisma.utils";

export async function getAllUsers(): Promise<ServiceResponse<{}>> {
  try {
    const users = await prisma.user.findMany()

    return {
      status: true,
      data: users
    }
  } catch(err) {
    Logger.error(`UserService.getAllUsers:: ${err}`)
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE
  }
}