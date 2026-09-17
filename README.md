# TOEIC Vocab Mastery — Apple iOS 18 Design Language

Website ôn tập từ vựng tiếng Anh TOEIC chuyên sâu theo từng ngày, được thiết kế theo chuẩn ngôn ngữ **Apple iOS 18 (Liquid Glass, SF Typography, Apple System Blue `#007AFF`)** dựa trên cấu trúc dữ liệu từ `material.json`.

---

## 🌟 Điểm Nhấn Tính Năng

- **Giao diện chuẩn Apple iOS 18**:
  - Vật liệu kính mờ **Liquid Glass / Frosted Glass** (`backdrop-blur-2xl`, hiệu ứng viền ánh sáng).
  - Màu chủ đạo **Apple Blue** (`#007AFF` / `#0A84FF`).
  - **Dynamic Island** tương tác trên đỉnh màn hình hiển thị chuỗi ngày học (Streak), hiệu ứng sóng âm thanh khi phát âm.
  - **Floating Glass Tab Bar** ở đáy màn hình với các tab Lộ trình, Từ vựng, Flashcard, Luyện tập, Thống kê.
  - Phản hồi xúc giác âm thanh **Apple Haptic Clicks & Success Chimes** qua Web Audio API.

- **Ôn tập bài học theo từng ngày (Day 0 → Day 35)**:
  - **36 Ngày học & 196 từ vựng TOEIC**: Lọc theo ngày, dặn dò lịch trả bài, hạn nộp, trạng thái bài tập.
  - **Phát âm chuẩn bản xứ**: Sử dụng Web Speech API offline và liên kết file audio đính kèm từ Google Classroom.
  - **Flashcards 3D**: Lật thẻ 3 chiều mượt mà, ghi nhớ từ đã thuộc, hỗ trợ phím tắt (`Space` lật thẻ, `1` ôn lại, `2` đã nhớ).
  - **Luyện tập tương tác**: Giải 124 câu bài tập về nhà điền từ và trắc nghiệm từ vựng nhanh có tính điểm.
  - **Apple Activity Rings**: Thống kê % từ vựng đã thuộc, số bài tập hoàn thành, ngày đã xong, danh sách từ khó đã bookmark.
  - **Khu vực Quizizz & Media**: Truy cập link phòng game Quizizz từng ngày (kèm thông tin giải thưởng) và thư viện tài liệu đính kèm (video, infographic, Google Forms).

---

## 🚀 Khởi Chạy Ứng Dụng

Di chuyển vào thư mục dự án:
```bash
cd /Users/andynguyen/workspace/ios-vocab-review
```

Chạy môi trường phát triển:
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

Hoặc build bản production:
```bash
npm run build
npm run start
```

---

## ⌨️ Phím Tắt Flashcard

- `Space`: Lật thẻ xem nghĩa tiếng Việt / mặt trước
- `1`: Đánh dấu chưa thuộc & chuyển từ tiếp
- `2`: Đánh dấu đã nhớ (thuộc từ)
- `Mũi tên Trái / Phải`: Xem từ trước / tiếp theo
- `Escape`: Đóng chế độ Flashcard
