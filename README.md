# 🏗️ Hệ Thống Quản Lý Cửa Hàng Vật Liệu Xây Dựng

## 📋 Mô Tả Dự Án

Hệ thống quản lý cửa hàng vật liệu xây dựng là một ứng dụng web toàn diện, được thiết kế để giúp các cửa hàng vật liệu xây dựng quản lý hiệu quả các hoạt động kinh doanh hàng ngày. Hệ thống cung cấp giao diện người dùng trực quan và các tính năng mạnh mẽ để quản lý sản phẩm, khách hàng, đơn hàng và theo dõi kinh doanh.

## ✨ Tính Năng Đã Hoàn Thành

### 🏠 Dashboard Tổng Quan
- **Thống kê tổng quan**: Hiển thị các chỉ số quan trọng như tổng số sản phẩm, đơn hàng hôm nay, doanh thu hôm nay
- **Cảnh báo tồn kho**: Hiển thị số lượng sản phẩm sắp hết hàng
- **Biểu đồ doanh thu**: Biểu đồ đường thể hiện doanh thu 7 ngày gần nhất
- **Biểu đồ phân bổ sản phẩm**: Biểu đồ tròn hiển thị sản phẩm theo danh mục
- **Đơn hàng gần đây**: Danh sách các đơn hàng mới nhất
- **Cảnh báo tồn kho thấp**: Danh sách sản phẩm cần nhập thêm

### 📦 Quản Lý Sản Phẩm
- **CRUD hoàn chỉnh**: Thêm, sửa, xóa, xem danh sách sản phẩm
- **Tìm kiếm và lọc**: Tìm kiếm theo tên, lọc theo danh mục và trạng thái
- **Phân trang**: Hiển thị sản phẩm với phân trang thông minh
- **Quản lý tồn kho**: Theo dõi số lượng tồn kho và cảnh báo hết hàng
- **Quản lý giá**: Quản lý giá vốn và giá bán
- **Phân loại sản phẩm**: Hỗ trợ nhiều danh mục (Xi măng, Gạch, Sắt thép, Cát sỏi, Sơn, Gỗ, Ống nước, Điện, Khác)

### 👥 Quản Lý Khách Hàng
- **Thông tin khách hàng**: Quản lý thông tin chi tiết của khách hàng
- **Phân loại khách hàng**: Hỗ trợ 3 loại khách hàng (Cá nhân, Công ty, Nhà thầu)
- **Quản lý công nợ**: Thiết lập và theo dõi hạn mức công nợ
- **Hệ thống điểm thưởng**: Tích lũy điểm thưởng cho khách hàng thân thiết
- **Lịch sử mua hàng**: Theo dõi tổng giá trị đã mua của khách hàng

### 🛒 Quản Lý Đơn Hàng
- **Tạo đơn hàng**: Giao diện trực quan để tạo đơn hàng mới
- **Quản lý chi tiết đơn hàng**: Thêm/xóa sản phẩm, tự động tính toán thành tiền
- **Theo dõi trạng thái**: 5 trạng thái đơn hàng (Chờ xử lý, Đang chuẩn bị, Đang giao, Đã giao, Đã hủy)
- **Quản lý thanh toán**: Theo dõi trạng thái thanh toán và phương thức thanh toán
- **Tự động tạo mã đơn hàng**: Hệ thống tự động tạo mã đơn hàng duy nhất
- **Tính toán tổng tiền**: Tự động tính toán với giảm giá và thuế

## 🗄️ Cấu Trúc Database

### Bảng `products` (Sản phẩm)
- **id**: ID sản phẩm (UUID)
- **name**: Tên sản phẩm
- **category**: Danh mục sản phẩm
- **unit**: Đơn vị tính (kg, bao, m³, m², m, cái, thùng, lít, tấn)
- **price**: Giá bán (VNĐ)
- **cost_price**: Giá vốn (VNĐ)
- **stock_quantity**: Số lượng tồn kho
- **min_stock**: Tồn kho tối thiểu
- **supplier_id**: ID nhà cung cấp
- **description**: Mô tả sản phẩm
- **status**: Trạng thái (Đang bán, Ngưng bán, Hết hàng)

### Bảng `customers` (Khách hàng)
- **id**: ID khách hàng (UUID)
- **name**: Tên khách hàng
- **phone**: Số điện thoại
- **email**: Email
- **address**: Địa chỉ
- **customer_type**: Loại khách hàng (Cá nhân, Công ty, Nhà thầu)
- **tax_code**: Mã số thuế
- **credit_limit**: Hạn mức công nợ (VNĐ)
- **total_spent**: Tổng tiền đã mua (VNĐ)
- **loyalty_points**: Điểm thưởng
- **notes**: Ghi chú

### Bảng `orders` (Đơn hàng)
- **id**: ID đơn hàng (UUID)
- **order_number**: Số đơn hàng
- **customer_id**: ID khách hàng
- **customer_name**: Tên khách hàng
- **order_date**: Ngày đặt hàng
- **delivery_date**: Ngày giao hàng
- **status**: Trạng thái đơn hàng
- **total_amount**: Tổng tiền (VNĐ)
- **discount**: Giảm giá (VNĐ)
- **tax_amount**: Tiền thuế (VNĐ)
- **final_amount**: Thành tiền (VNĐ)
- **payment_status**: Trạng thái thanh toán
- **payment_method**: Phương thức thanh toán
- **delivery_address**: Địa chỉ giao hàng
- **notes**: Ghi chú

### Bảng `order_items` (Chi tiết đơn hàng)
- **id**: ID chi tiết đơn hàng (UUID)
- **order_id**: ID đơn hàng
- **product_id**: ID sản phẩm
- **product_name**: Tên sản phẩm
- **unit_price**: Giá đơn vị (VNĐ)
- **quantity**: Số lượng
- **unit**: Đơn vị tính
- **total_price**: Thành tiền (VNĐ)
- **discount_percent**: % giảm giá
- **discount_amount**: Tiền giảm giá (VNĐ)

### Bảng `suppliers` (Nhà cung cấp)
- **id**: ID nhà cung cấp (UUID)
- **name**: Tên nhà cung cấp
- **contact_person**: Người liên hệ
- **phone**: Số điện thoại
- **email**: Email
- **address**: Địa chỉ
- **tax_code**: Mã số thuế
- **payment_terms**: Điều kiện thanh toán
- **status**: Trạng thái
- **notes**: Ghi chú

### Bảng `inventory_transactions` (Giao dịch kho)
- **id**: ID giao dịch kho (UUID)
- **product_id**: ID sản phẩm
- **transaction_type**: Loại giao dịch
- **quantity**: Số lượng
- **unit_cost**: Giá nhập (VNĐ)
- **total_cost**: Tổng giá trị (VNĐ)
- **reference_id**: ID tham chiếu
- **reference_type**: Loại tham chiếu
- **transaction_date**: Ngày giao dịch
- **notes**: Ghi chú

## 🌐 Các Endpoint API Sử Dụng

Hệ thống sử dụng RESTful Table API để quản lý dữ liệu:

### Sản phẩm
- `GET tables/products` - Lấy danh sách sản phẩm
- `GET tables/products/{id}` - Lấy thông tin sản phẩm theo ID
- `POST tables/products` - Tạo sản phẩm mới
- `PUT tables/products/{id}` - Cập nhật sản phẩm
- `DELETE tables/products/{id}` - Xóa sản phẩm

### Khách hàng
- `GET tables/customers` - Lấy danh sách khách hàng
- `GET tables/customers/{id}` - Lấy thông tin khách hàng theo ID
- `POST tables/customers` - Tạo khách hàng mới
- `PUT tables/customers/{id}` - Cập nhật khách hàng
- `DELETE tables/customers/{id}` - Xóa khách hàng

### Đơn hàng
- `GET tables/orders` - Lấy danh sách đơn hàng
- `GET tables/orders/{id}` - Lấy thông tin đơn hàng theo ID
- `POST tables/orders` - Tạo đơn hàng mới
- `PUT tables/orders/{id}` - Cập nhật đơn hàng
- `DELETE tables/orders/{id}` - Xóa đơn hàng

### Chi tiết đơn hàng
- `GET tables/order_items` - Lấy danh sách chi tiết đơn hàng
- `POST tables/order_items` - Tạo chi tiết đơn hàng mới
- `DELETE tables/order_items/{id}` - Xóa chi tiết đơn hàng

## 🚧 Tính Năng Chưa Hoàn Thành

### 🏭 Quản Lý Nhà Cung Cấp
- [ ] Thêm/sửa/xóa thông tin nhà cung cấp
- [ ] Quản lý điều kiện thanh toán
- [ ] Theo dõi lịch sử nhập hàng

### 📊 Báo Cáo và Thống Kê
- [ ] Báo cáo doanh thu theo thời gian
- [ ] Báo cáo tồn kho chi tiết
- [ ] Báo cáo sản phẩm bán chạy
- [ ] Báo cáo công nợ khách hàng
- [ ] Xuất báo cáo PDF/Excel

### 🏪 Quản Lý Kho Hàng
- [ ] Nhập kho từ nhà cung cấp
- [ ] Xuất kho khi bán hàng
- [ ] Kiểm kê tồn kho
- [ ] Điều chỉnh tồn kho
- [ ] Lịch sử xuất nhập kho

### 💰 Quản Lý Tài Chính
- [ ] Quản lý thu chi
- [ ] Theo dõi công nợ
- [ ] Quản lý hóa đơn
- [ ] Báo cáo tài chính

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Tailwind CSS
- **Icons**: Font Awesome
- **Charts**: Chart.js
- **Fonts**: Google Fonts (Inter)
- **Database**: RESTful Table API
- **Architecture**: Single Page Application (SPA)

## 📁 Cấu Trúc Thư Mục

```
📦 construction-materials-store/
├── 📄 index.html              # Trang chính
├── 📁 js/
│   └── 📄 main.js            # JavaScript chính
├── 📄 README.md              # Tài liệu hướng dẫn
└── 📁 assets/ (tương lai)
    ├── 📁 images/            # Hình ảnh
    └── 📁 css/               # CSS tùy chỉnh
```

## 🚀 Hướng Dẫn Sử Dụng

### 🏁 Khởi Động
1. Mở file `index.html` trong trình duyệt web
2. Hệ thống sẽ tự động tải dữ liệu và hiển thị dashboard

### 📦 Quản Lý Sản Phẩm
1. Truy cập menu \"Quản lý sản phẩm\"
2. Nhấn \"Thêm sản phẩm\" để tạo sản phẩm mới
3. Sử dụng thanh tìm kiếm và bộ lọc để tìm sản phẩm
4. Nhấn biểu tượng chỉnh sửa/xóa để thao tác với sản phẩm

### 👥 Quản Lý Khách Hàng
1. Truy cập menu \"Khách hàng\"
2. Nhấn \"Thêm khách hàng\" để tạo khách hàng mới
3. Phân loại khách hàng theo: Cá nhân, Công ty, Nhà thầu
4. Thiết lập hạn mức công nợ cho khách hàng

### 🛒 Tạo Đơn Hàng
1. Truy cập menu \"Đơn hàng\"
2. Nhấn \"Tạo đơn hàng\" 
3. Chọn khách hàng từ danh sách
4. Thêm sản phẩm vào đơn hàng
5. Hệ thống tự động tính toán tổng tiền
6. Lưu đơn hàng

### 📊 Xem Báo Cáo
1. Dashboard hiển thị các thống kê tổng quan
2. Biểu đồ doanh thu 7 ngày gần nhất
3. Cảnh báo sản phẩm sắp hết hàng
4. Danh sách đơn hàng gần đây

## 🔧 Các Bước Phát Triển Tiếp Theo

### Ưu Tiên Cao
1. **Hoàn thành module Nhà cung cấp**: Thêm giao diện và logic quản lý nhà cung cấp
2. **Phát triển module Kho hàng**: Tích hợp quản lý xuất nhập kho với đơn hàng
3. **Cải thiện UI/UX**: Tối ưu hóa giao diện cho mobile và tablet

### Ưu Tiên Trung Bình
4. **Báo cáo nâng cao**: Thêm các báo cáo chi tiết và khả năng xuất file
5. **Quản lý tài chính**: Tích hợp quản lý thu chi và công nợ
6. **Tính năng tìm kiếm nâng cao**: Cải thiện khả năng tìm kiếm và lọc dữ liệu

### Ưu Tiên Thấp
7. **Tích hợp in ấn**: In hóa đơn, phiếu xuất nhập kho
8. **Sao lưu và phục hồi**: Tính năng backup dữ liệu
9. **Đa ngôn ngữ**: Hỗ trợ tiếng Anh

## 🎯 Mục Tiêu Dự Án

Hệ thống quản lý cửa hàng vật liệu xây dựng nhằm:
- **Số hóa quy trình**: Chuyển đổi quy trình quản lý từ thủ công sang số hóa
- **Tăng hiệu quả**: Giảm thời gian xử lý và tăng độ chính xác
- **Kiểm soát tồn kho**: Theo dõi chính xác số lượng hàng tồn kho
- **Quản lý khách hàng**: Xây dựng cơ sở dữ liệu khách hàng và lịch sử mua hàng
- **Báo cáo kinh doanh**: Cung cấp các báo cáo để hỗ trợ ra quyết định

## 📞 Hỗ Trợ và Liên Hệ

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng:
- Kiểm tra tài liệu hướng dẫn này
- Liên hệ với đội phát triển để được hỗ trợ kỹ thuật

---

**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 01/09/2025  
**Trạng thái**: Đang phát triển  
**Giấy phép**: Sử dụng nội bộ