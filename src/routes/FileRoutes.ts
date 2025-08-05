// import { authenticate } from "$middlewares/auth.middleware";
import { Router } from "express";
import * as FileController from "$controllers/rest/FileController"

const FileRoutes = Router({mergeParams: true})

FileRoutes.post("/upload", FileController.uploadFile)
FileRoutes.get("/", FileController.getFiles)
FileRoutes.get("/:id", FileController.getFileById)
FileRoutes.get("/:id/data", FileController.getFileData)

export default FileRoutes