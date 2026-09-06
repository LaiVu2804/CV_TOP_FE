import { useMutation } from "@tanstack/react-query";
import { callUploadSingleFile } from "@/config/api";
import { message, notification } from "antd";

export const useUpload = () => {
  const mutation = useMutation({
    mutationFn: async ({ file, folder }: { file: any; folder: string }) => {
      const res = await callUploadSingleFile(file, folder);
      if (!res.data) throw res;
      return res.data.fileName;
    },
    onError: (error: any) => {
      notification.error({
        message: "Lỗi upload file",
        description: error?.message || "Không thể tải file lên",
      });
    },
  });

  return {
    uploadFile: mutation.mutateAsync,
    isUploading: mutation.isPending,
  };
};
