import { IResume } from "@/types/backend";
import { Button, Descriptions, Drawer, Form, Select } from "antd"; // Bỏ message, notification import thừa
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useResume } from "@/hooks/useResume"; // IMPORT HOOK

const { Option } = Select;

interface IProps {
  onClose: (v: boolean) => void;
  open: boolean;
  dataInit: IResume | null | any;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

const ViewDetailResume = (props: IProps) => {
  const { onClose, open, dataInit, setDataInit, reloadTable } = props;
  const [form] = Form.useForm();

  const { updateResumeStatus, isUpdating } = useResume();

  const handleChangeStatus = async () => {
    const status = form.getFieldValue("status");
    if (dataInit?.id) {
      await updateResumeStatus({ id: dataInit.id, status });
      setDataInit(null);
      onClose(false);
    }
  };

  useEffect(() => {
    if (dataInit) {
      form.setFieldValue("status", dataInit.status);
    }
    return () => form.resetFields();
  }, [dataInit]);

  return (
    <Drawer
      title="Thông Tin Resume"
      placement="right"
      onClose={() => {
        onClose(false);
        setDataInit(null);
      }}
      open={open}
      width={"40vw"}
      maskClosable={false}
      destroyOnClose
      extra={
        <Button
          loading={isUpdating} // Sử dụng loading state từ hook
          type="primary"
          onClick={handleChangeStatus}
        >
          Change Status
        </Button>
      }
    >
      <Descriptions title="" bordered column={2} layout="vertical">
        <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Form form={form}>
            <Form.Item name={"status"} style={{ margin: 0 }}>
              <Select style={{ width: "100%" }}>
                <Option value="PENDING">PENDING</Option>
                <Option value="REVIEWING">REVIEWING</Option>
                <Option value="APPROVED">APPROVED</Option>
                <Option value="REJECTED">REJECTED</Option>
              </Select>
            </Form.Item>
          </Form>
        </Descriptions.Item>
        <Descriptions.Item label="Tên Job">
          {dataInit?.job?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Tên Công Ty">
          {dataInit?.companyName}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {dataInit && dataInit.createdAt
            ? dayjs(dataInit.createdAt).format("DD-MM-YYYY HH:mm:ss")
            : ""}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sửa">
          {dataInit && dataInit.updatedAt
            ? dayjs(dataInit.updatedAt).format("DD-MM-YYYY HH:mm:ss")
            : ""}
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};

export default ViewDetailResume;
