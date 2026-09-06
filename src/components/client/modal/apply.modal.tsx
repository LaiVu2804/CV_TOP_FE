import { IJob } from "@/types/backend";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import {
  Button,
  Col,
  ConfigProvider,
  Divider,
  Modal,
  Row,
  Upload,
  message,
  notification,
} from "antd";
import { useNavigate } from "react-router-dom";
import enUS from "antd/lib/locale/en_US";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons"; // Thêm LoadingOutlined
import type { UploadProps } from "antd";
import { callCreateResume } from "@/config/api";
import { useState } from "react";
import { useAuth } from "@/context/auth.context";
import { useUpload } from "@/hooks/useUpload"; // Import Hook

interface IProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  jobDetail: IJob | null;
}

const ApplyModal = (props: IProps) => {
  const { isModalOpen, setIsModalOpen, jobDetail } = props;
  const { isAuthenticated, user } = useAuth();
  const { uploadFile, isUploading } = useUpload(); // Sử dụng hook

  const [urlCV, setUrlCV] = useState<string>("");
  const navigate = useNavigate();

  const handleOkButton = async () => {
    if (!urlCV && isAuthenticated) {
      message.error("Vui lòng upload CV!");
      return;
    }

    if (!isAuthenticated) {
      setIsModalOpen(false);
      navigate(`/login?callback=${window.location.href}`);
    } else {
      if (jobDetail) {
        const res = await callCreateResume(
          urlCV,
          jobDetail?.id,
          user?.email as string,
          user?.id as string
        );
        if (res.data) {
          message.success("Nộp CV thành công!");
          setUrlCV("");
          setIsModalOpen(false);
        } else {
          notification.error({
            message: "Có lỗi xảy ra",
            description: res.message,
          });
        }
      }
    }
  };

  const propsUpload: UploadProps = {
    maxCount: 1,
    multiple: false,
    accept: "application/pdf,application/msword, .doc, .docx, .pdf",
    async customRequest({ file, onSuccess, onError }: any) {
      try {
        // Sử dụng hook uploadFile
        const fileName = await uploadFile({ file, folder: "resume" });
        setUrlCV(fileName);
        if (onSuccess) onSuccess("ok");
      } catch (error) {
        if (onError) {
          setUrlCV("");
          onError({ event: error });
        }
      }
    },
    onChange(info) {
      if (info.file.status !== "uploading") {
        // console.log(info.file, info.fileList);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === "error") {
        // Hook đã xử lý notification error, ở đây chỉ cần log hoặc bỏ qua
        // message.error(...)
      }
    },
  };

  return (
    <>
      <Modal
        title="Ứng Tuyển Job"
        open={isModalOpen}
        onOk={() => handleOkButton()}
        onCancel={() => setIsModalOpen(false)}
        maskClosable={false}
        okText={isAuthenticated ? "Nộp CV Nào " : "Đăng Nhập Nhanh"}
        cancelButtonProps={{ style: { display: "none" } }}
        destroyOnClose={true}
      >
        <Divider />
        {isAuthenticated ? (
          <div>
            <ConfigProvider locale={enUS}>
              <ProForm
                submitter={{
                  render: () => <></>,
                }}
              >
                <Row gutter={[10, 10]}>
                  <Col span={24}>
                    <div>
                      Bạn đang ứng tuyển công việc <b>{jobDetail?.name} </b>tại{" "}
                      <b>{jobDetail?.company?.name}</b>
                    </div>
                  </Col>
                  <Col span={24}>
                    <ProFormText
                      fieldProps={{
                        type: "email",
                      }}
                      label="Email"
                      name={"email"}
                      labelAlign="right"
                      disabled
                      initialValue={user?.email}
                    />
                  </Col>
                  <Col span={24}>
                    <ProForm.Item
                      label={"Upload file CV"}
                      rules={[
                        { required: true, message: "Vui lòng upload file!" },
                      ]}
                    >
                      <Upload {...propsUpload}>
                        <Button
                          icon={
                            isUploading ? (
                              <LoadingOutlined />
                            ) : (
                              <UploadOutlined />
                            )
                          }
                        >
                          {isUploading
                            ? "Đang tải lên..."
                            : "Tải lên CV ( *.doc, *.docx, *.pdf, < 5MB )"}
                        </Button>
                      </Upload>
                    </ProForm.Item>
                  </Col>
                </Row>
              </ProForm>
            </ConfigProvider>
          </div>
        ) : (
          <div>
            Bạn chưa đăng nhập hệ thống. Vui lòng đăng nhập để có thể nộp
            bạn nhé -.-
          </div>
        )}
        <Divider />
      </Modal>
    </>
  );
};
export default ApplyModal;
