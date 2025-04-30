// internal import
import { CustomError } from "../lib/error";
import formService from "../service/form";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

async function createForm(
  req: AuthRequest<
    { formId: string; formSchema: string },
    {},
    { ttlInSec: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { formId, formSchema } = req.body;
  const { ttlInSec } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!formId || !formSchema) {
      throw new CustomError("formId and formSchema required", 400);
    }

    const collageId = req.authUser.collageId;

    const newForm = await formService.createNewForm({
      collageId,
      formId,
      formSchema,
      ttlInSec,
    });
    if (!newForm) {
      throw new CustomError("form not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "form cached successfully",
    });
  } catch (error) {
    next(error);
  }
}

async function getForms(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;

    const forms = await formService.getAllForms(collageId);
    if (!forms) {
      throw new CustomError("form value not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "form value fetched successfully",
      forms: forms,
    });
  } catch (error) {
    next(error);
  }
}

async function getForm(
  req: AuthRequest<{}, { formId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { formId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!formId) {
      throw new CustomError("form id required", 400);
    }

    const collageId = req.authUser.collageId;

    const formJson = await formService.getFormValueInJson(collageId, formId);
    if (!formJson) {
      throw new CustomError("form value not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "form value fetched successfully",
      formValue: formJson,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteForm(
  req: AuthRequest<{}, { formId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { formId } = req.params;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!formId) {
      throw new CustomError("form id required", 400);
    }

    const collageId = req.authUser.collageId;

    const isDel = await formService.deleteForm(collageId, formId);
    if (!isDel) {
      throw new CustomError("form value not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "form removed from cahce successfully",
      removedItem: isDel,
    });
  } catch (error) {
    next(error);
  }
}

// export
export default {
  createForm,
  getForms,
  getForm,
  deleteForm,
};
