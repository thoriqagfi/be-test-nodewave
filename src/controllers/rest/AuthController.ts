import { Request, Response } from 'express';
import * as AuthService from "$services/AuthService";
import { handleServiceErrorWithResponse, response_success, response_created } from '$utils/response.utils';
import { UserLoginDTO, UserRegisterDTO } from '$entities/User';

export async function register(req: Request, res: Response): Promise<Response> {
  const userData: UserRegisterDTO = req.body;

  const serviceResponse = await AuthService.register(userData);

  if (!serviceResponse.status) {
    return handleServiceErrorWithResponse(res, serviceResponse);
  }

  return response_created(res, serviceResponse.data, "User registered successfully!");
}

export async function login(req: Request, res: Response): Promise<Response> {
  const loginData: UserLoginDTO = req.body;

  const serviceResponse = await AuthService.login(loginData);

  if (!serviceResponse.status) {
    return handleServiceErrorWithResponse(res, serviceResponse);
  }

  return response_success(res, serviceResponse.data, "Login successful!");
}

export async function refreshToken(req: Request, res: Response): Promise<Response> {
  const { refreshToken } = req.body;

  const serviceResponse = await AuthService.refreshToken(refreshToken);

  if (!serviceResponse.status) {
    return handleServiceErrorWithResponse(res, serviceResponse);
  }

  return response_success(res, serviceResponse.data, "Token refreshed successfully!");
}