# Xe điện Đức Tú — Phú Quốc

Ứng dụng React Native/Expo cho iOS, Android và web. Giao diện xanh navy, điểm nhấn vàng theo thông tin thương hiệu người dùng cung cấp.

## Chạy trên Windows hoặc máy tính

Cài Node.js **24 LTS** (backend cần `node:sqlite`, Node >=22.13).
Mở CMD tại thư mục có `package.json`:

```bat
npm ci
npm run server
```

Giữ cửa sổ trên mở. Mở CMD thứ hai trong cùng thư mục:

```bat
npm run web
```

Mặc định API chạy ở `http://localhost:3001`, Expo web ở cổng 8081. Nếu Expo chọn cổng khác, đặt `ALLOWED_ORIGINS` cho backend rồi khởi động lại:

```bat
set ALLOWED_ORIGINS=http://localhost:8082
npm run server
```

### Điện thoại trong cùng mạng LAN

Chạy backend với `set HOST=0.0.0.0` trước `npm run server`. Chỉ mở cổng 3001 trên mạng riêng tin cậy. Trong CMD chạy Expo, đặt `set EXPO_PUBLIC_API_URL=http://DIA_CHI_IP_MAY_TINH:3001`, rồi `npm start`. Cần Expo Go tương thích SDK 57. Không dùng `localhost` trên điện thoại để trỏ tới máy tính. Build iOS cần macOS/Xcode hoặc dịch vụ build ngoài.

## Tính năng

- Tìm kiếm, danh mục, thương hiệu, sắp xếp giá, yêu thích, so sánh tối đa 3 xe.
- Thư viện ảnh; trình xem xoay chỉ bật khi có tối thiểu 12 khung ảnh cùng mẫu/màu xe, theo thứ tự đủ vòng. Không biến một ảnh thường thành 360°.
- Giỏ hàng, kiểm tra thông tin giao hàng, tạo và xem đơn theo tài khoản.
- Đăng ký, đăng nhập, đăng xuất, đổi mật khẩu xác thực mật khẩu cũ.
- Mật khẩu băm scrypt với salt ngẫu nhiên. Session ngẫu nhiên, hết hạn 24 giờ; đổi mật khẩu thu hồi toàn bộ session. Không lưu token vào localStorage.
- SQLite lưu tài khoản và đơn tại `server/data/store.db` (được Git bỏ qua). Session chỉ trong RAM, khởi động lại server cần đăng nhập lại.
- Tổng giá đơn do server tính; API không chấp nhận giá do client đưa lên. Có giới hạn body, đăng nhập, kiểm tra origin và truy vấn SQL tham số hóa.

## Dữ liệu và giới hạn

Tên, slogan, số điện thoại được đọc từ banner người dùng gửi. Địa chỉ cần cửa hàng xác nhận cách viết chính xác. Logo/banner được thấy trong chat nhưng chưa có file đính kèm truy cập được trong checkout, nên chưa nhúng ảnh gốc và icon Expo vẫn là mặc định.

**Danh mục, giá, tồn kho đang là dữ liệu minh họa**, không phải dữ liệu đã lấy từ YADEA. Truy cập `yadea.com` và `yadea.com.vn` từ cloud bị proxy chặn 403. Chưa có ảnh xe hoặc bộ ảnh 360° đã xác minh. Không hiển thị ảnh stock khác loại sản phẩm. Metadata frontend hỗ trợ `images`, `frames360`, `sourceUrl`, `priceCheckedAt` để tích hợp dữ liệu đúng nguồn khi truy cập được.

Banner Back to School có mức giảm 500.000–2 triệu đồng nhưng chưa xác minh thời hạn và điều kiện, nên app yêu cầu xác nhận với cửa hàng.

Đây là **bản phát triển cục bộ**, chưa triển khai cho khách hàng thật. Đơn là thử nghiệm, không thanh toán/giao hàng thật và chưa trừ tồn kho. Chưa có khôi phục mật khẩu qua email, xác minh email, trang quản trị, triển khai HTTPS, lưu session phân tán hoặc sao lưu vận hành. Favorites/cart còn trong RAM của app. Không nhập mật khẩu nhạy cảm vào bản demo HTTP.

## Kiểm tra

```sh
npm run typecheck
npm run test:api
CI=1 EXPO_NO_TELEMETRY=1 npx expo export --platform web
CI=1 EXPO_NO_TELEMETRY=1 npx expo export --platform ios --platform android --output-dir dist-native
```

Trên Windows CMD, đặt `set CI=1` và `set EXPO_NO_TELEMETRY=1` riêng trước lệnh `npx`.

Test API sử dụng cơ sở dữ liệu tạm, kiểm tra tài khoản, đơn hàng riêng tư, giá do server tính và thu hồi phiên sau đổi mật khẩu. Chưa kiểm thử thao tác UI trên trình duyệt/thiết bị.
