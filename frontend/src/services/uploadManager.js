// src/services/uploadManager.js

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const storage = getStorage();

/*
  Singleton Upload Manager
  يمنع تكرار الرفع + يعمل بالخلفية
*/

class UploadManager {
  constructor() {
    this.activeUploads = new Map();
  }

  uploadFile({
    file,
    path,
    onProgress,
    onSuccess,
    onError,
  }) {
    const uploadId = `${file.name}_${file.size}`;

    // 🚫 منع رفع نفس الملف أكثر من مرة
    if (this.activeUploads.has(uploadId)) {
      console.log("Upload already running");
      return;
    }

    const storageRef = ref(storage, path);

    const task = uploadBytesResumable(storageRef, file);

    this.activeUploads.set(uploadId, task);

    task.on(
      "state_changed",

      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        onProgress && onProgress(Math.round(progress));
      },

      (error) => {
        this.activeUploads.delete(uploadId);
        onError && onError(error);
      },

      async () => {
        const url = await getDownloadURL(task.snapshot.ref);

        this.activeUploads.delete(uploadId);

        onSuccess && onSuccess(url);
      }
    );
  }
}

export default new UploadManager();
