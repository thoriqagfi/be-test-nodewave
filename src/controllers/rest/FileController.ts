import { Request, Response } from 'express';
import * as FileService from "$services/FileService"
import { handleServiceErrorWithResponse, response_success } from '$utils/response.utils';
import { checkFilteringQueryV2 } from '$controllers/helpers/CheckFilteringQuery';

export async function uploadFile(req: Request, res: Response): Promise<Response> {
  const { fileUrl, fileName, fileType, fileSize, createdBy } = req.body;

  if (!fileUrl || !fileName) {
    return res.status(400).json({
      status: false,
      message: "fileUrl and fileName are required"
    });
  }

  const serviceResponse = await FileService.uploadFile({
    fileUrl,
    fileName,
    fileType: fileType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileSize: fileSize || 0,
    createdBy
  });

  if (!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse);

  return response_success(res, serviceResponse.data, "File upload initiated successfully!");
}

export async function getFiles(req: Request, res: Response): Promise<Response> {
  const filter = checkFilteringQueryV2(req);
  const serviceResponse = await FileService.getFiles(filter);

  if (!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse);

  return response_success(res, serviceResponse.data, "Files retrieved successfully!");
}

export async function getFileById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params;
  const serviceResponse = await FileService.getFileById(id);

  if (!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse);

  return response_success(res, serviceResponse.data, "File retrieved successfully!");
}

export async function getFileData(req: Request, res: Response): Promise<Response> {
  const { id } = req.params;
  const filter = checkFilteringQueryV2(req);
  const serviceResponse = await FileService.getFileData(id, filter);

  if (!serviceResponse.status) return handleServiceErrorWithResponse(res, serviceResponse);

  return response_success(res, serviceResponse.data, "File data retrieved successfully!");
}