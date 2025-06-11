// internal import
import { CustomError } from "../lib/error";
import formService from "../service/form";

// types import
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";

async function createForm(
  req: AuthRequest<
    { formId: string; formSchema: string; role: string; batchId?: string },
    {},
    { ttlInSec: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { formId, formSchema, role, batchId } = req.body;
  const { ttlInSec } = req.query;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!formId || !formSchema || !role) {
      throw new CustomError("formId, role and formSchema required", 400);
    }

    const collageId = req.authUser.collageId;

    const newForm = await formService.createNewForm({
      collageId,
      formId,
      role,
      batchId,
      formSchema,
      ttlInSec,
    });
    if (!newForm) {
      throw new CustomError("form not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "form cached successfully",
      formKey: newForm,
    });
  } catch (error) {
    next(error);
  }
}

interface ISumitStudentProps {
  identity: {
    name: string;
    batch: string;
    rollNo?: string;
  };
  keyInfo: { batchId: string; formName: string };
  data: { [key: string]: any };
}
async function submitStudentForm(
  req: AuthRequest<ISumitStudentProps>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const {
    data,
    identity: { name, batch, rollNo },
    keyInfo: { batchId, formName },
  } = req.body;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!name || !batch) {
      throw new CustomError("name, batch and roll no required", 400);
    }

    if (!batchId || !formName) {
      throw new CustomError("batch id and form title required", 404);
    }

    const collageId = req.authUser.collageId;
    const userRole = req.authUser.role;

    const newForm = await formService.submitStudentForm({
      collageId,
      name,
      batch,
      rollNo,
      userRole,
      batchId,
      formName,
      data,
    });
    if (!newForm) {
      throw new CustomError("form not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "form sumit successfully",
      formKey: newForm,
    });
  } catch (error) {
    next(error);
  }
}

interface ISumitOtherProps {
  identity: { name: string };
  keyInfo: { formName: string };
  data: { [key: string]: any };
}
async function submitOtherForm(
  req: AuthRequest<ISumitOtherProps>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const {
    data,
    identity: { name },
    keyInfo: { formName },
  } = req.body;

  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!name) {
      throw new CustomError("name required", 400);
    }

    if (!formName) {
      throw new CustomError("form title required", 404);
    }

    const collageId = req.authUser.collageId;
    const userRole = req.authUser.role;

    const newForm = await formService.submitOtherForm({
      collageId,
      name,
      userRole,
      formName,
      data,
    });
    if (!newForm) {
      throw new CustomError("form not created", 500);
    }

    res.status(200).json({
      success: true,
      message: "form sumit successfully",
      formKey: newForm,
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

async function getFormTitles(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    const collageId = req.authUser.collageId;
    const role = req.authUser.role;

    const formTitles = await formService.getAllFormTitles(collageId, role);
    if (!formTitles) {
      throw new CustomError("form value not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "form-titles fetched successfully",
      formTitles: formTitles,
    });
  } catch (error) {
    next(error);
  }
}

async function getFormByIdentity(
  req: AuthRequest<{}, {}, { identity: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { identity } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!identity) {
      throw new CustomError("form id required", 400);
    }

    const collageId = req.authUser.collageId;

    const formJsons = await formService.getFormsByIdentity(collageId, identity);
    if (formJsons.length === 0) {
      throw new CustomError("forms not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "forms fetched successfully",
      forms: formJsons,
    });
  } catch (error) {
    next(error);
  }
}

async function getSubmittedFormData(
  req: AuthRequest<{}, {}, { formKey: string }>,
  res: Response,
  next: NextFunction
) {
  const { formKey } = req.query;
  try {
    if (!req.authUser) {
      throw new CustomError("unauthorized user", 401);
    }

    if (!formKey) {
      throw new CustomError("form key required", 404);
    }

    const formData = await formService.getSubmittedFormData(formKey);
    if (!formData) {
      throw new CustomError("form not missing or expired", 404);
    }

    res.status(200).json({
      success: true,
      message: "forms fetched successfully",
      formData: formData,
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
  getFormTitles,
  getFormByIdentity,
  getSubmittedFormData,
  submitStudentForm,
  submitOtherForm,
  deleteForm,
};
