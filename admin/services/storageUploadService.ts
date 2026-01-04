
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebase";

export interface UploadResult {
  downloadUrl: string;
  refPath: string;
}

export const uploadFile = (
  file: File,
  path: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    if (!storage) {
      reject(new Error("Firebase Storage is not configured or initialized."));
      return;
    }

    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          downloadUrl,
          refPath: path,
        });
      }
    );
  });
};

export const getThumbnailPath = (courseId: string, fileName: string) => 
  `courseThumbnails/${courseId}/${Date.now()}-${fileName}`;

export const getLessonAssetPath = (courseId: string, moduleId: string, lessonId: string, fileName: string) => 
  `courseAssets/${courseId}/${moduleId}/${lessonId}/${Date.now()}-${fileName}`;
