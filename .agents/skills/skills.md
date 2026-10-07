# HƯỚNG DẪN VÀ PROMPT MẪU: THIẾT KẾ KIẾN TRÚC ROUTING & GIAO DIỆN (NESTED LAYOUT PATTERN)

Tài liệu này cung cấp **Master Prompt** chuẩn hóa giúp bạn chỉ thị cho bất kỳ AI nào (Claude, ChatGPT, Gemini, Copilot, Cursor) xây dựng hệ thống Frontend React theo mô hình **Nested Layout Routing (Route lồng nhau kết hợp Layout Wrapper)** chuẩn mực như dự án hiện tại nhưng được nâng cấp sạch sẽ và tối ưu hơn.

---

## 📌 MASTER PROMPT DÀNH CHO AI (COPY & PASTE)

> **Hướng dẫn sử dụng:** Copy toàn bộ đoạn dưới đây và gửi cho AI khi bạn bắt đầu một dự án mới hoặc muốn tái cấu trúc lại luồng giao diện Frontend.

```markdown
Bạn là một chuyên gia Frontend React & TypeScript cấp cao. Hãy giúp tôi thiết kế và triển khai kiến trúc điều hướng (Routing) và phân tách giao diện (Layout Architecture) cho ứng dụng React bằng cách sử dụng `react-router-dom` (phiên bản 6+ với `createBrowserRouter`).

### 1. YÊU CẦU KIẾN TRÚC TỔNG THỂ (Nested Layout Pattern)
Hệ thống cần phân chia giao diện thành 3 nhóm luồng riêng biệt:
1. **Public/Client Layout (`LayoutClient`):**
   - Bao gồm Header (cố định trên cùng, chứa navigation menu, avatar, auth status, notification).
   - Nội dung động ở giữa thông qua thẻ `<Outlet />` (chứa các trang như Trang chủ, Danh sách việc làm, Chi tiết việc làm, Danh sách công ty, Chi tiết công ty,...).
   - Footer (cố định dưới cùng).
   - Tự động cuộn lên đầu trang (`scrollIntoView` hoặc `ScrollRestoration`) khi chuyển trang.
2. **Admin Back-Office Layout (`LayoutAdmin`):**
   - Được bảo vệ bởi cơ chế Route Guard / Protected Route (chỉ tài khoản đăng nhập có quyền mới truy cập được).
   - Bố cục dạng Dashboard: Sidebar bên trái (có thể thu gọn/mở rộng, phân quyền theo vai trò/permissions), Header Admin bên phải (hiển thị thông tin admin, nút toggle sidebar, logout), và thẻ `<Outlet />` chứa nội dung quản trị (Dashboard, Users, Companies, Jobs, Permissions, Roles,...).
3. **Standalone / Blank Layout (Giao diện độc lập):**
   - Không chứa Header/Footer/Sidebar chung, hiển thị toàn màn hình riêng biệt (Login, Register, trang 404 Not Found, trang 403 Forbidden).

---

### 2. CÁC BEST PRACTICES CẦN TUÂN THỦ NGHIÊM NGẶT
1. **Bảo vệ Route gọn gàng (Single-point Route Protection):**
   - Tuyệt đối KHÔNG bọc `<ProtectedRoute>` thủ công lặp đi lặp lại ở từng route con.
   - Hãy bọc `<ProtectedRoute>` trực tiếp ở route cha `/admin` bao bọc lấy `<LayoutAdmin />`. Khi đó tất cả các route con tự động được thừa hưởng lớp bảo vệ.
2. **Quản lý dữ liệu tìm kiếm/lọc (Search & Filter State):**
   - Ưu tiên đồng bộ trạng thái tìm kiếm (keywords, filters) lên URL Search Params (`useSearchParams`) thay vì lưu trong biến state nội bộ của Layout. Điều này đảm bảo khi người dùng F5 hoặc chia sẻ đường link URL, kết quả tìm kiếm vẫn được giữ nguyên.
3. **Điều hướng chuẩn SPA:**
   - Sử dụng hook `useNavigate()` hoặc thẻ `<Link to="...">` từ `react-router-dom`. Tránh sử dụng `window.location.href` để tránh reload toàn bộ ứng dụng làm mất trạng thái SPA.
4. **Giữ nguyên State & Tránh Re-render:**
   - Khi chuyển trang giữa các route con trong cùng một layout (ví dụ từ Trang chủ sang Danh sách việc làm), Header và Footer KHÔNG được phép unmount hoặc reload lại.

---

### 3. CẤU TRÚC THƯ MỤC MẪU
Hãy tổ chức code theo cấu trúc sau:
```
src/
├── components/
│   ├── client/
│   │   ├── header.client.tsx
│   │   └── footer.client.tsx
│   ├── admin/
│   │   ├── layout.admin.tsx
│   │   ├── admin-header.tsx
│   │   └── admin-sidebar.tsx
│   └── share/
│       ├── protected-route.tsx
│       ├── not-found.tsx
│       └── not-permitted.tsx
├── layouts/
│   ├── client.layout.tsx
│   └── admin.layout.tsx
├── pages/
│   ├── client/ (home, job, company,...)
│   ├── admin/  (dashboard, user, role,...)
│   └── auth/   (login, register)
├── routes/
│   └── index.tsx (cấu hình createBrowserRouter)
└── App.tsx
```

---

### 4. OUTPUT YÊU CẦU:
Hãy cung cấp mã nguồn TypeScript React đầy đủ, sạch sẽ, chuẩn types cho:
1. `ProtectedLayout.tsx` (Component Route Guard kiểm tra token & role người dùng).
2. `LayoutClient.tsx` (Header + Outlet + Footer + Scroll restoration).
3. `LayoutAdmin.tsx` (Sidebar + Header + Outlet).
4. `routes/index.tsx` (File cấu hình router tập trung sử dụng `createBrowserRouter` và `RouterProvider`).
```

---

## 💡 CODE MẪU THAM KHẢO CHUẨN MỰC (BOILERPLATE)

Dưới đây là đoạn code chuẩn mực đã được tối ưu loại bỏ các nhược điểm của code cũ:

### 1. `src/routes/index.tsx` (Cấu hình Router tập trung)
```tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import LayoutClient from "@/layouts/client.layout";
import LayoutAdmin from "@/layouts/admin.layout";
import ProtectedRoute from "@/components/share/protected-route";

// Pages
import HomePage from "@/pages/home";
import JobPage from "@/pages/job";
import JobDetailPage from "@/pages/job/detail";
import DashboardPage from "@/pages/admin/dashboard";
import UserPage from "@/pages/admin/user";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import NotFound from "@/components/share/not-found";

export const router = createBrowserRouter([
  // 1. Nhánh Client (Public)
  {
    path: "/",
    element: <LayoutClient />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "job", element: <JobPage /> },
      { path: "job/:id", element: <JobDetailPage /> },
      // Thêm các trang client khác tại đây
    ],
  },

  // 2. Nhánh Admin (Được bảo vệ tập trung 1 lần tại route cha)
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireRole="ADMIN">
        <LayoutAdmin />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "user", element: <UserPage /> },
      // Thêm các trang admin khác tại đây
    ],
  },

  // 3. Nhánh Standalone (Không có layout)
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
```

### 2. `src/layouts/client.layout.tsx` (Client Layout với `<Outlet />`)
```tsx
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "@/components/client/header.client";
import Footer from "@/components/client/footer.client";

export default function LayoutClient() {
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn lên đầu trang khi đổi route
  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.pathname]);

  return (
    <div className="layout-client" ref={rootRef}>
      <Header />
      <main className="content-app" style={{ minHeight: "calc(100vh - 140px)" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

### 3. `src/components/share/protected-route.tsx` (Route Guard)
```tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth.context";
import Loading from "./loading";
import NotPermitted from "./not-permitted";

interface IProps {
  children: React.ReactNode;
  requireRole?: string;
}

export default function ProtectedRoute({ children, requireRole }: IProps) {
  const { isAuthenticated, appLoading, user } = useAuth();

  if (appLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role?.name === "NORMAL_USER") {
    return <NotPermitted />;
  }

  return <>{children}</>;
}
```
