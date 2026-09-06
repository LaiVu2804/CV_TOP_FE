import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  callCreateSkill,
  callDeleteSkill,
  callFetchAllSkill,
  callUpdateSkill,
} from "@/config/api";
import { message, notification } from "antd";
import { IBackendRes, IModelPaginate, ISkill } from "@/types/backend";

export const useSkill = (queryString: string | null = null) => {
  const queryClient = useQueryClient();

  const query = useQuery<IBackendRes<IModelPaginate<ISkill>>>({
    queryKey: ["skills", queryString],
    queryFn: () => callFetchAllSkill(queryString || "") as any,
    placeholderData: keepPreviousData,
    enabled: !!queryString,
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await callCreateSkill(name);
      if (!res.data) throw res;
      return res.data;
    },
    onSuccess: () => {
      message.success("Thêm mới Skill thành công");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (error: any) => {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error?.message || "Không thể tạo mới skill",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string }) => {
      const res = await callUpdateSkill(data.id, data.name);
      if (!res.data) throw res;
      return res.data;
    },
    onSuccess: () => {
      message.success("Cập nhật Skill thành công");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (error: any) => {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error?.message || "Không thể cập nhật skill",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await callDeleteSkill(id);
      if (+res.statusCode !== 200) throw res;
      return res;
    },
    onSuccess: () => {
      message.success("Xóa Skill thành công");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: (error: any) => {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error?.message || "Không thể xóa skill",
      });
    },
  });

  return {
    skills: query.data?.data?.result ?? [],
    meta: query.data?.data?.meta ?? {
      page: 1,
      pageSize: 10,
      total: 0,
      pages: 0,
    },
    isFetching: query.isFetching,

    createSkill: createMutation.mutateAsync,
    updateSkill: updateMutation.mutateAsync,
    deleteSkill: deleteMutation.mutateAsync,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
