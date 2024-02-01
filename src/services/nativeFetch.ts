import { CapacitorHttp } from "@capacitor/core";
import { CapFormDataEntry } from "@capacitor/core/types/definitions-internal";

// Stolen from capacitor fetch shim
// https://github.com/ionic-team/capacitor/blob/5.2.3/core/native-bridge.ts

export const webviewServerUrl =
  "WEBVIEW_SERVER_URL" in window &&
  typeof window.WEBVIEW_SERVER_URL === "string"
    ? window.WEBVIEW_SERVER_URL
    : "";

export default async function nativeFetch(
  resource: RequestInfo | URL,
  options?: RequestInit,
) {
  if (resource.toString().startsWith(`${webviewServerUrl}/`)) {
    return window.fetch(resource, options);
  }

  try {
    // intercept request & pass to the bridge
    const {
      data: requestData,
      type,
      headers,
    } = await convertBody(options?.body || undefined);
    let optionHeaders = options?.headers;
    if (options?.headers instanceof Headers) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      optionHeaders = Object.fromEntries((options.headers as any).entries());
    }
    const nativeResponse = await CapacitorHttp.request({
      url: resource as never,
      method: options?.method ? options.method : undefined,
      data: requestData,
      dataType: type,
      headers: {
        ...headers,
        ...optionHeaders,
      },
    });

    const contentType =
      nativeResponse.headers["Content-Type"] ||
      nativeResponse.headers["content-type"];
    let data = contentType?.startsWith("application/json")
      ? JSON.stringify(nativeResponse.data)
      : nativeResponse.data;

    // use null data for 204 No Content HTTP response
    if (nativeResponse.status === 204) {
      data = null;
    }

    // intercept & parse response before returning
    const response = new Response(data, {
      headers: nativeResponse.headers,
      status: nativeResponse.status,
    });

    /*
     * copy url to response, `cordova-plugin-ionic` uses this url from the response
     * we need `Object.defineProperty` because url is an inherited getter on the Response
     * see: https://stackoverflow.com/a/57382543
     * */
    Object.defineProperty(response, "url", {
      value: nativeResponse.url,
    });

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
}

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const data = reader.result as string;
      resolve(btoa(data));
    };
    reader.onerror = reject;

    reader.readAsBinaryString(file);
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertFormData = async (formData: FormData): Promise<any> => {
  const newFormData: CapFormDataEntry[] = [];
  for (const pair of formData.entries()) {
    const [key, value] = pair;
    if (value instanceof File) {
      const base64File = await readFileAsBase64(value);
      newFormData.push({
        key,
        value: base64File,
        type: "base64File",
        contentType: value.type,
        fileName: value.name,
      });
    } else {
      newFormData.push({ key, value, type: "string" });
    }
  }

  return newFormData;
};

const convertBody = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: Document | XMLHttpRequestBodyInit | ReadableStream<any> | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  if (body instanceof FormData) {
    const formData = await convertFormData(body);
    const boundary = `${Date.now()}`;
    return {
      data: formData,
      type: "formData",
      headers: {
        "Content-Type": `multipart/form-data; boundary=--${boundary}`,
      },
    };
  } else if (body instanceof File) {
    const fileData = await readFileAsBase64(body);
    return {
      data: fileData,
      type: "file",
      headers: { "Content-Type": body.type },
    };
  }

  return { data: body, type: "json" };
};
