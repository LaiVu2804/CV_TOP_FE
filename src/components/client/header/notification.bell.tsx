import { BellOutlined } from "@ant-design/icons";
import { Badge, Popover, List, Empty, Spin } from "antd";
import { callFetchNotifications, callMarkReadNotification } from "@/config/api";
import { useAuth } from "@/context/auth.context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import styles from "@/styles/notification.module.scss";

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await callFetchNotifications();
      return res.data || [];
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await callMarkReadNotification(id);
    },
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<any[]>(["notifications"]);
      queryClient.setQueryData(["notifications"], (old: any[] = []) =>
        old.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount = (notifications || []).filter((n: any) => !n.read).length;

  const handleRead = (item: any) => {
    if (!item.read) {
      markReadMutation.mutate(item.id);
    }
  };

  const content = (
    <div className={styles.wrapper}>
      {isLoading ? (
        <div className={styles.loadingWrap}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Empty
            description="Không có thông báo"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          renderItem={(item: any) => (
            <List.Item
              onClick={() => handleRead(item)}
              className={`${styles.item} ${!item.read ? styles.unread : ""}`}
            >
              <List.Item.Meta
                title={<div className={styles.title}>{item.title}</div>}
                description={
                  <div>
                    <div className={styles.content}>{item.content}</div>
                    <div className={styles.time}>
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title="Thông báo"
      trigger="click"
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" overflowCount={99}>
        <BellOutlined
          role="button"
          aria-label="Thông báo"
          style={{ fontSize: 20, cursor: "pointer", color: "#a7a7a7" }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
