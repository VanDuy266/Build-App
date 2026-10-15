# APK Android và phát hành iOS

## Trạng thái

Đã chuẩn bị hai profile EAS: `preview` xuất **APK Android**, `production` xuất **AAB Google Play / bản iOS App Store**. Chưa tạo file APK/IPA, chưa gửi duyệt hay phát hành. Mã định danh đề xuất cho cả hai nền tảng: `vn.ductu.phuquoc`; cần kiểm tra thuộc quyền sử dụng của cửa hàng trước build đầu tiên. Icon hiện vẫn là icon mẫu Expo, cần thay bằng file logo cửa hàng gốc.

## Điều kiện trước build dùng được

- Tài khoản Expo/EAS và project liên kết với app.
- Backend triển khai HTTPS công khai; API cục bộ của máy tính không phục vụ khách bên ngoài.
- Đặt `EXPO_PUBLIC_API_URL` cho từng môi trường EAS, không chứa token/mật khẩu. URL API được đóng gói công khai vào app. `app.config.js` chặn EAS build khi thiếu HTTPS API hoặc dùng localhost.
- iOS App Store: Apple Developer Program còn hiệu lực, quyền App Store Connect, App ID, chứng chỉ và provisioning profile. EAS có thể hướng dẫn tạo thông qua tài khoản được cấp quyền. Không đưa tài khoản/mật khẩu vào mã nguồn hoặc chat.

## Tạo APK cài Android

Tại thư mục dự án trên máy tính, đăng nhập trực tiếp vào CLI:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest env:create --environment preview --name EXPO_PUBLIC_API_URL --visibility plaintext
npx eas-cli@latest build --platform android --profile preview
```

Lệnh env:create sẽ hỏi URL HTTPS thật. CLI build có thể hỏi tạo Android keystore; lưu và giữ quyền sở hữu khóa của cửa hàng. Sau khi build thành công, trang kết quả EAS mới cung cấp link tải APK. Nếu biến đã tồn tại, dùng trang Environment Variables trên Expo để sửa thay vì tạo trùng.

## Tạo bản iOS để đưa lên App Store Connect

```sh
npx eas-cli@latest env:create --environment production --name EXPO_PUBLIC_API_URL --visibility plaintext
npx eas-cli@latest build --platform ios --profile production
```

Khi build thành công và có tài khoản App Store Connect phù hợp:

```sh
npx eas-cli@latest submit --platform ios --profile production
```

Chỉ submit sau khi chủ cửa hàng kiểm tra đúng build và tài khoản đích. Submit đưa build lên App Store Connect, **không tự phát hành**. Cần kiểm thử TestFlight, hoàn thiện hồ sơ rồi gửi Apple duyệt. IPA App Store không cài trực tiếp như APK.

## Trước khi gửi duyệt thật

App hiện là bản phát triển, cần hoàn thiện các mục sau trước khi nộp:

- Dữ liệu xe/ảnh/giá đúng nguồn, điều kiện khuyến mãi chính xác; loại bỏ dữ liệu thử và nội dung chờ.
- Nhúng logo thật, ảnh màn hình thiết bị, mô tả, URL hỗ trợ và chính sách quyền riêng tư công khai.
- Luồng xóa tài khoản trong app, khôi phục tài khoản, vận hành backend bền vững, sao lưu dữ liệu và quản lý bí mật.
- Khai báo App Privacy/Data Safety đúng dữ liệu thu thập (email, tên, số điện thoại, địa chỉ, đơn hàng).
- Tài khoản demo cho người duyệt nếu cần; máy chủ hoạt động trong quá trình duyệt.
- Kiểm thử trên điện thoại thật: kết nối mạng, bàn phím, đăng nhập, đổi mật khẩu, giỏ hàng và đơn hàng. Các test API và export JS không thay thế kiểm thử thiết bị hoặc native build.

Không có dịch vụ thanh toán thực trong bản này. Đơn thử nghiệm chưa trừ kho, chưa giao hàng. Không quảng bá là app bán hàng sẵn sàng vận hành cho tới khi hoàn tất các mục còn thiếu.
