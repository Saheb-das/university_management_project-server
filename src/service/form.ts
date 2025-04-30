// internal import
import cache from "../cache/nodeCache";
import { CustomError } from "../lib/error";
import collageRepository from "../repository/collage";

type TFormProps = {
  collageId: string;
  formId: string;
  formSchema: string;
  ttlInSec?: string;
};
async function createNewForm(formProps: TFormProps): Promise<string | null> {
  try {
    const collage = await collageRepository.findById(formProps.collageId);
    if (!collage) {
      throw new CustomError("collage not found", 404);
    }

    const cacheKey = `${collage.id}_${formProps.formId}`;
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

async function getFormValueInJson(
  collageId: string,
  formId: string
): Promise<string | null> {
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

    const formValue = cache.get<string>(cacheKey);
    if (!formValue) {
      throw new CustomError("cache value not found", 404);
    }

    return formValue;
  } catch (error) {
    console.log("Error caching form", error);
    return null;
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
  getFormValueInJson,
  deleteForm,
};
