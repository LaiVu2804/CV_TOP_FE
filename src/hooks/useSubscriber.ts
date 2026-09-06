import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  callCreateSubscriber,
  callUpdateSubscriber,
  callGetSubscriberSkills,
} from "@/config/api";
import { IBackendRes, ISubscribers } from "@/types/backend";
import { message, notification } from "antd";

export const useSubscriber = () => {
  const queryClient = useQueryClient();

  const query = useQuery<IBackendRes<ISubscribers>>({
    queryKey: ["subscriber-skills"],
    queryFn: () => callGetSubscriberSkills() as any,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ISubscribers) => {
      const res = await callCreateSubscriber(data);
      if (!res.data) throw res;
      return res.data;
    },
    onSuccess: () => {
      message.success("Đăng ký nhận tin thành công");
      queryClient.invalidateQueries({ queryKey: ["subscriber-skills"] });
    },
    onError: (error: any) => {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error?.message || "Lỗi đăng ký",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ISubscribers) => {
      const res = await callUpdateSubscriber(data);
      if (!res.data) throw res;
      return res.data;
    },
    onSuccess: () => {
      message.success("Cập nhật thông tin thành công");
      queryClient.invalidateQueries({ queryKey: ["subscriber-skills"] });
    },
    onError: (error: any) => {
      notification.error({
        message: "Có lỗi xảy ra",
        description: error?.message || "Lỗi cập nhật",
      });
    },
  });

  return {
    subscriberData: query.data?.data,
    isLoading: query.isLoading,

    createSubscriber: createMutation.mutateAsync,
    updateSubscriber: updateMutation.mutateAsync,

    isSubmitting: createMutation.isPending || updateMutation.isPending,
  };
};
