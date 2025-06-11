// internal import
import cache from "../cache/nodeCache";
import { CustomError } from "../lib/error";
import collageRepository from "../repository/collage";

type TFormProps = {
  collageId: string;
  formId: string;
  role: string;
  batchId?: string;
  formSchema: string;
  ttlInSec?: string;
};
async function createNewForm(formProps: TFormProps): Promise<string | null> {
  try {
    const collage = await collageRepository.findById(formProps.collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    let identity: string;
    if (formProps.role === "student" && formProps.batchId) {
      identity = `${formProps.role}:${formProps.batchId}`;
    } else {
      identity = `${formProps.role}`;
    }

    const cacheKey = `${collage.id}_${identity}_${formProps.formId}`;
    const cacheValue = formProps.formSchema;

    let isCached: any;
    if (formProps.ttlInSec) {
      isCached = cache.set(cacheKey, cacheValue, formProps.ttlInSec);
    } else {
      isCached = cache.set(cacheKey, cacheValue);
    }
    if (!isCached) {
      throw new CustomError("form not cached", 500);
    }

    return cacheKey;
  } catch (error) {
    console.log("Error caching form", error);
    return null;
  }
}

interface StudentSubmitProps {
  collageId: string;
  name: string;
  batch: string;
  rollNo?: string;
  userRole: string;
  batchId: string;
  formName: string;
  data: { [key: string]: any };
}
interface ISetFormValue {
  [key: string]: string | { [key: string]: any };
  data: { [key: string]: any };
}
async function submitStudentForm(
  payload: StudentSubmitProps
): Promise<boolean> {
  const submitCacheKey = `submit_${payload.collageId}_${payload.userRole}:${payload.batchId}_${payload.formName}`;

  const existing = cache.get<ISetFormValue[]>(submitCacheKey);

  const dataPayload = {
    name: payload.name,
    batch: payload.batch,
    rollNo: payload.rollNo || "",
    data: payload.data,
  };

  if (existing) {
    existing.push(dataPayload);
    cache.set(submitCacheKey, existing);
  } else {
    cache.set(submitCacheKey, [dataPayload]);
  }

  return true;
}

interface OtherSubmitProps {
  collageId: string;
  name: string;
  userRole: string;
  formName: string;
  data: { [key: string]: any };
}
async function submitOtherForm(payload: OtherSubmitProps): Promise<boolean> {
  const submitCacheKey = `submit_${payload.collageId}_${payload.userRole}_${payload.formName}`;

  const existing = cache.get<ISetFormValue[]>(submitCacheKey);

  const dataPayload = {
    name: payload.name,
    role: payload.userRole,
    data: payload.data,
  };

  if (existing) {
    existing.push(dataPayload);
    cache.set(submitCacheKey, existing);
  } else {
    cache.set(submitCacheKey, [dataPayload]);
  }

  return true;
}

type TForm = {
  formId: string;
  formValue: string;
};
async function getAllForms(collageId: string): Promise<TForm[] | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const allKeys = cache.keys();

    const filtered = allKeys
      .filter((key) => key.startsWith(`${collage.id}_`))
      .map((key) => {
        const formId = key.split("_")[1];
        const formValue = cache.get(key);

        // Only include if not expired and value exists
        if (formValue !== undefined) {
          return { formId, formValue };
        }
        return null;
      })
      .filter(
        (entry): entry is { formId: string; formValue: string } =>
          entry !== null
      );

    return filtered;
  } catch (error) {
    console.log("Error caching form", error);
    return null;
  }
}

async function getSubmittedFormData(
  formKey: string
): Promise<ISetFormValue[] | []> {
  try {
    const key = `submit_${formKey}`;

    const value = cache.get<ISetFormValue[]>(key);
    if (!value) {
      throw new CustomError("form data not found", 404);
    }

    return value;
  } catch (error) {
    console.log("Error fetching form data", error);
    return [];
  }
}

async function getAllFormTitles(
  collageId: string,
  role: string
): Promise<string[] | []> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found");
    }

    const allKeys = cache.keys();

    let preStrKey = "";
    if (role === "examceller") {
      preStrKey = `${collage.id}_`;
    } else {
      preStrKey = `${collage.id}_${role}`;
    }

    const titles = allKeys.filter((key) => key.startsWith(preStrKey));

    return titles;
  } catch (error) {
    console.log("Error fetching all form-titles", error);
    return [];
  }
}

interface IIdentityForms {
  formId: string;
  formValue: string;
}
async function getFormsByIdentity(
  collageId: string,
  identity: string
): Promise<IIdentityForms[] | []> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const allKeys = cache.keys();

    const allForms = allKeys
      .filter((key) => key.startsWith(`${collage.id}_${identity}_`))
      .map((key) => {
        const formId = key.split("_")[2];
        const formValue = cache.get(key);

        // Only include if not expired and value exists
        if (formValue !== undefined) {
          return { formId, formValue };
        }
        return null;
      })
      .filter(
        (entry): entry is { formId: string; formValue: string } =>
          entry !== null
      );

    return allForms;
  } catch (error) {
    console.log("Error caching form", error);
    return [];
  }
}

async function deleteForm(
  collageId: string,
  formId: string
): Promise<number | null> {
  try {
    const collage = await collageRepository.findById(collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const cacheKey = `${collage.id}_${formId}`;

    const isGet = cache.has(cacheKey);
    if (!isGet) {
      throw new CustomError("Form is missing or expired", 400);
    }

    const deletedForm = cache.del(cacheKey);
    if (!deletedForm) {
      throw new CustomError("cache value not found", 404);
    }

    return deletedForm;
  } catch (error) {
    console.log("Error caching form", error);
    return null;
  }
}

// export
export default {
  createNewForm,
  getAllForms,
  getAllFormTitles,
  getFormsByIdentity,
  getSubmittedFormData,
  submitStudentForm,
  submitOtherForm,
  deleteForm,
};
