export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert Blob to data URL."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading Blob."));
    };

    reader.readAsDataURL(blob);
  });
}

export function blobToString(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64String = btoa(reader.result as string);
      resolve(base64String);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsBinaryString(blob);
  });
}
