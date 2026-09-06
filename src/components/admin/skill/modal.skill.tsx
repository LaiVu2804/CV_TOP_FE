import { ModalForm, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row } from "antd";
import { isMobile } from "react-device-detect";
import { ISkill } from "@/types/backend";
import { useEffect } from "react";
import { useSkill } from "@/hooks/useSkill";

interface IProps {
  openModal: boolean;
  setOpenModal: (v: boolean) => void;
  dataInit?: ISkill | null;
  setDataInit: (v: any) => void;
  reloadTable: () => void;
}

const ModalSkill = (props: IProps) => {
  const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
  const [form] = Form.useForm();

  const { createSkill, updateSkill, isCreating, isUpdating } = useSkill();

  useEffect(() => {
    if (dataInit?.id) {
      form.setFieldsValue(dataInit);
    }
  }, [dataInit]);

  const submitSkill = async (valuesForm: any) => {
    const { name } = valuesForm;

    if (dataInit?.id) {
      await updateSkill({ id: dataInit.id, name });
      handleReset();
    } else {
      await createSkill(name);
      handleReset();
      reloadTable();
    }
  };

  const handleReset = async () => {
    form.resetFields();
    setDataInit(null);
    setOpenModal(false);
  };

  return (
    <ModalForm
      title={<>{dataInit?.id ? "Cập nhật Skill" : "Tạo mới Skill"}</>}
      open={openModal}
      modalProps={{
        onCancel: () => {
          handleReset();
        },
        afterClose: () => handleReset(),
        destroyOnClose: true,
        width: isMobile ? "100%" : 600,
        keyboard: false,
        maskClosable: false,
        okText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
        cancelText: "Hủy",
        okButtonProps: { loading: isCreating || isUpdating }, // Loading state
      }}
      scrollToFirstError={true}
      preserve={false}
      form={form}
      onFinish={submitSkill}
      initialValues={dataInit?.id ? dataInit : {}}
    >
      <Row gutter={16}>
        <Col span={24}>
          <ProFormText
            label="Tên skill"
            name="name"
            rules={[{ required: true, message: "Vui lòng không bỏ trống" }]}
            placeholder="Nhập tên skill"
          />
        </Col>
      </Row>
    </ModalForm>
  );
};

export default ModalSkill;
