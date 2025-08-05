import { Request, Response } from 'express';
import * as UserService from '$services/UserService'
import { handleServiceErrorWithResponse, response_success } from '$utils/response.utils';

export async function getProfile(req: Request, res: Response): Promise<Response> {
  return response_success(res, req.user, "Profile retrieved successfully");
}

export async function getAllUsers(req: Request, res: Response): Promise<Response> {
  const serviceResponse = await UserService.getAllUsers()

  if (!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse)

  return response_success(res, serviceResponse, "Users retrieved successfully");
}