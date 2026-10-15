# Maison — app bán hàng

Bản mẫu React Native + Expo, dùng chung mã nguồn iOS, Android và web.

## Chạy

```sh
npm ci
npm start
```

Dùng Expo Go phiên bản tương thích với Expo SDK 57 để mở trên thiết bị. Simulator iOS cần macOS/Xcode; Android emulator cần Android SDK. Môi trường đám mây này chưa kiểm thử trên thiết bị thật.

```sh
npm run web
npm run typecheck
npx expo export --platform web
npx expo export --platform ios --platform android
```

## Chức năng

- Danh mục, tìm kiếm, chi tiết sản phẩm và yêu thích.
- Giỏ hàng, tăng/giảm số lượng, tính tổng.
- Kiểm tra thông tin giao hàng và tạo đơn mẫu.
- Ảnh sản phẩm từ Unsplash, cần kết nối mạng.

Đây là bản demo: dữ liệu chỉ lưu trong bộ nhớ phiên hiện tại. Không gửi thông tin đến máy chủ, không thu tiền, không thực hiện giao hàng. Cần bổ sung backend, xác thực, tồn kho, lưu trữ đơn hàng và thanh toán trước khi sử dụng thương mại. Sản phẩm, giá và chính sách là minh họa.
