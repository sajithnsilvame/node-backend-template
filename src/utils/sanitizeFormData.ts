// utils/sanitizeFormData.ts

type Primitive = string | boolean | number | null | undefined;
type JSONValue = Primitive | JSONObject | JSONArray;
interface JSONObject { [key: string]: JSONValue; }
interface JSONArray extends Array<JSONValue> {}

export function sanitizeFormData<T extends Record<string, any>>(formData: T): T {
  const result: Record<string, any> = {};

  for (const key in formData) {
    let value = formData[key];

    // Handle empty strings as undefined
    if (value === '') {
      continue; // skip setting
    }

    // Try to parse JSON strings (for arrays or objects)
    if (typeof value === 'string' && value.trim().startsWith('{') || value.trim().startsWith('[')) {
      try {
        value = JSON.parse(value);
      } catch {
        // If parse fails, keep original string
      }
    }

    // Normalize booleans
    if (value === 'true') value = true as T[Extract<keyof T, string>];
    else if (value === 'false') value = false as T[Extract<keyof T, string>];

    result[key] = value;
  }

  return result as T;
}
