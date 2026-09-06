import DataTable from "@/components/client/data-table";
import { IResume } from "@/types/backend";
import {
  ActionType,
  ProColumns,
  ProFormSelect,
} from "@ant-design/pro-components";
import { Space, Popconfirm } from "antd";
import { useState, useRef } from "react";
import dayjs from "dayjs";
import queryString from "query-string";
import ViewDetailResume from "@/components/admin/resume/view.resume";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useResume } from "@/hooks/useResume";

const ResumePage = () => {
  const [dataInit, setDataInit] = useState<IResume | null>(null);
  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const tableRef = useRef<ActionType>();

  const [params, setParams] = useState({
    current: 1,
    pageSize: 10,
    sort: "updatedAt,desc",
    filter: "",
  });

  const queryStr = queryString.stringify(
    {
      page: params.current,
      size: params.pageSize,
      sort: params.sort,
      filter: params.filter || undefined,
    },
    { skipNull: true, skipEmptyString: true }
  );

  const { resumes, meta, isFetching, deleteResume, isDeleting } =
    useResume(queryStr);

  console.log(resumes);
  const handleDeleteResume = async (id: string | undefined) => {
    if (id) await deleteResume(id);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    let sortBy = "";
    if (sorter && sorter.status)
      sortBy = sorter.status === "ascend" ? "status,asc" : "status,desc";
    if (sorter && sorter.createdAt)
      sortBy =
        sorter.createdAt === "ascend" ? "createdAt,asc" : "createdAt,desc";
    if (sorter && sorter.updatedAt)
      sortBy =
        sorter.updatedAt === "ascend" ? "updatedAt,asc" : "updatedAt,desc";
    if (!sortBy) sortBy = "updatedAt,desc";

    let filterStr = "";
    if (filters?.status && filters.status.length > 0) {
      filterStr += `${sfIn("status", filters.status)}`;
    }

    setParams({
      current: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
      sort: sortBy,
      filter: filterStr,
    });
  };

  const columns: ProColumns<IResume>[] = [
    {
      title: "Id",
      dataIndex: "id",
      width: 50,
      render: (text, record, index, action) => {
        return (
          <a
            href="#"
            onClick={() => {
              setOpenViewDetail(true);
              setDataInit(record);
            }}
          >
            {record.id}
          </a>
        );
      },
      hideInSearch: true,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      sorter: true,
      valueType: "select",
      valueEnum: {
        PENDING: { text: "PENDING" },
        REVIEWING: { text: "REVIEWING" },
        APPROVED: { text: "APPROVED" },
        REJECTED: { text: "REJECTED" },
      },
      renderFormItem: (item, props, form) => (
        <ProFormSelect showSearch mode="multiple" allowClear {...props} />
      ),
    },
    {
      title: "Job",
      dataIndex: ["job", "name"],
      hideInSearch: true,
    },
    {
      title: "Company",
      dataIndex: "companyName",
      hideInSearch: true,
    },
    {
      title: "CreatedAt",
      dataIndex: "createdAt",
      width: 200,
      sorter: true,
      render: (text, record) => (
        <>
          {record.createdAt
            ? dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")
            : ""}
        </>
      ),
      hideInSearch: true,
    },
    {
      title: "UpdatedAt",
      dataIndex: "updatedAt",
      width: 200,
      sorter: true,
      render: (text, record) => (
        <>
          {record.updatedAt
            ? dayjs(record.updatedAt).format("DD-MM-YYYY HH:mm:ss")
            : ""}
        </>
      ),
      hideInSearch: true,
    },
    {
      title: "CV",
      dataIndex: "url",
      hideInSearch: true,
      render: (text, record) => {
        return (
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/storage/resume/${
              record?.url
            }`}
            target="_blank"
            rel="noreferrer"
          >
            Xem file
          </a>
        );
      },
    },
    {
      title: "Actions",
      hideInSearch: true,
      width: 100,
      render: (_value, entity) => (
        <Space>
          <EditOutlined
            style={{ fontSize: 20, color: "#ffa500" }}
            onClick={() => {
              setOpenViewDetail(true);
              setDataInit(entity);
            }}
          />
          <Access permission={ALL_PERMISSIONS.RESUMES.DELETE} hideChildren>
            <Popconfirm
              placement="leftTop"
              title={"Xác nhận xóa resume"}
              description={"Bạn có chắc chắn muốn xóa resume này ?"}
              onConfirm={() => handleDeleteResume(entity.id)}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ loading: isDeleting }}
            >
              <span style={{ cursor: "pointer", margin: "0 10px" }}>
                <DeleteOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
              </span>
            </Popconfirm>
          </Access>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Access permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}>
        <DataTable<IResume>
          actionRef={tableRef}
          headerTitle="Danh sách Resumes"
          rowKey="id"
          loading={isFetching}
          columns={columns}
          dataSource={resumes}
          onChange={handleTableChange}
          scroll={{ x: true }}
          pagination={{
            current: meta.page,
            pageSize: meta.pageSize,
            showSizeChanger: true,
            total: meta.total,
            showTotal: (total, range) => (
              <div>
                {" "}
                {range[0]}-{range[1]} trên {total} rows
              </div>
            ),
          }}
          rowSelection={false}
          toolBarRender={() => []} // Không có nút tạo mới ở trang này
        />
      </Access>
      <ViewDetailResume
        open={openViewDetail}
        onClose={setOpenViewDetail}
        dataInit={dataInit}
        setDataInit={setDataInit}
        reloadTable={() => {
          // Khi update status xong, hook tự invalidate,
          // ta không cần làm gì thêm, hoặc có thể reset params nếu muốn
        }}
      />
    </div>
  );
};

export default ResumePage;
