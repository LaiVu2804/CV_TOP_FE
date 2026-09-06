import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  callDeleteResume,
  callFetchResume,
  callUpdateResumeStatus,
} from "@/config/api";
import { message, notification } from "antd";
import { IBackendRes, IModelPaginate, IResume } from "@/types/backend";

export const useResume = (queryString: string | null = null) => {
  const queryClient = useQueryClient();

  const query = useQuery<IBackendRes<IModelPaginate<IResume>>>({
    queryKey: ["resumes", queryString],
    queryFn: () => callFetchResume(queryString || "") as any,
    placeholderData: keepPreviousData,
    enabled: !!queryString,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      const res = await callUpdateResumeStatus(data.id, data.status);
      if (!res.data) throw res;
      return res.data;
    },
    onSuccess: () => {
      message.success("Cập nhật trạng thái Resume thành công");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (error: any) => {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error?.message || "Không thể cập nhật trạng thái",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await callDeleteResume(id);
      if (!res.data) throw res;
      return res.data;
    },
    onSuccess: () => {
      message.success("Xóa Resume thành công");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (error: any) => {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error?.message || "Không thể xóa resume",
      });
    },
  });

  return {
    resumes: query.data?.data?.result ?? [],
    meta: query.data?.data?.meta ?? {
      page: 1,
      pageSize: 10,
      total: 0,
      pages: 0,
    },
    isFetching: query.isFetching,

    updateResumeStatus: updateStatusMutation.mutateAsync,
    deleteResume: deleteMutation.mutateAsync,

    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
