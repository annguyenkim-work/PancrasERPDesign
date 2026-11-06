# Feature Specification: Bảo hành điện tử

**Feature Branch**: `012-bao-hanh`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Bảo hành: tra cứu bằng số điện thoại hoặc serial, xem thẻ bảo hành, kích hoạt thẻ mới, và lập phiếu tiếp nhận sửa chữa."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tra cứu bảo hành (Priority: P1)

Nhân viên nhập số điện thoại hoặc số serial. Nếu có thẻ khớp, màn hình hiện mặt hàng, serial, khách, số điện thoại và hạn đang ghi trên thẻ. Nếu không khớp, màn báo không tìm thấy.

**Why this priority**: Tra cứu là việc khách hỏi đầu tiên.

**Independent Test**: Tra một serial đã có thẻ và một serial không có, thấy một kết quả và một báo không thấy.

**Acceptance Scenarios**:

1. **Given** một thẻ đã có serial, **When** nhân viên tra đúng serial đó, **Then** thấy mặt hàng, serial, khách và hạn đang ghi.
2. **Given** nhân viên nhập một số không khớp thẻ nào, **When** tra cứu, **Then** màn báo không tìm thấy và không hiện thẻ giả.
3. **Given** ô tra cứu đang trống, **When** nhân viên bấm tra, **Then** không hiện kết quả mới.

---

### User Story 2 - Xem thẻ và kích hoạt thẻ (Priority: P2)

Nhân viên mở danh sách thẻ và thấy các thẻ đang có. Nhân viên kích hoạt một thẻ mới bằng mặt hàng, serial, tên khách và số điện thoại. Thẻ mới xuất hiện trong danh sách và tra được bằng serial vừa nhập.

**Why this priority**: Thẻ phải có thì tra cứu mới ra.

**Independent Test**: Kích hoạt một serial mới, thấy thẻ trong danh sách, rồi tra đúng serial đó.

**Acceptance Scenarios**:

1. **Given** nhân viên mở danh sách thẻ, **When** danh sách tải, **Then** thấy các thẻ đang có với serial và khách.
2. **Given** phiếu kích hoạt đang mở, **When** nhân viên nhập mặt hàng, serial chưa có, tên khách và số điện thoại rồi lưu, **Then** thẻ xuất hiện trong danh sách.
3. **Given** serial trùng một thẻ đang có, **When** nhân viên lưu, **Then** thẻ mới không được tạo.

---

### User Story 3 - Lập phiếu tiếp nhận (Priority: P3)

Nhân viên lập phiếu tiếp nhận cho một thẻ: mô tả lỗi và lưu. Phiếu xuất hiện trong danh sách phiếu với serial và trạng thái đang tiếp nhận.

**Why this priority**: Phiếu sửa chữa đến sau khi đã có thẻ để tra.

**Independent Test**: Từ một thẻ đã có, lập phiếu với mô tả lỗi và thấy phiếu trong danh sách.

**Acceptance Scenarios**:

1. **Given** một thẻ đang có, **When** nhân viên nhập mô tả lỗi và lưu phiếu, **Then** phiếu hiện trong danh sách với serial của thẻ đó.
2. **Given** mô tả lỗi đang trống, **When** nhân viên lưu, **Then** phiếu không được tạo.

---

### Edge Cases

- Tra bằng số điện thoại có nhiều thẻ: hiện tất cả thẻ của số đó, không chỉ một thẻ.
- Serial có khoảng trắng đầu cuối: tra cứu vẫn khớp thẻ nếu phần chữ số giống serial đã lưu.
- Đóng phiếu kích hoạt bằng hủy: không tạo thẻ.
- Phiếu đã bàn giao xong không còn trong số phiếu đang mở, nếu danh sách đang lọc phiếu chưa bàn giao.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST tra bằng số điện thoại hoặc serial. Khớp thì MUST thấy mặt hàng, serial, khách và hạn đang ghi. Không khớp thì MUST báo không tìm thấy.
- **FR-002**: Nhân viên MUST xem danh sách thẻ đang có.
- **FR-003**: Nhân viên MUST kích hoạt thẻ khi có mặt hàng, serial chưa trùng, tên khách và số điện thoại. Thẻ mới MUST tra được bằng serial đó.
- **FR-004**: Nhân viên MUST lập phiếu tiếp nhận khi có một thẻ và một mô tả lỗi. Phiếu MUST hiện serial của thẻ.
- **FR-005**: Ngày bắt đầu hạn bảo hành MUST [NEEDS CLARIFICATION: tính từ ngày bán, ngày giao, hay ngày khách kích hoạt? Phần Chưa chốt chưa có câu trả lời.]
- **FR-006**: Cách quản lý từng món MUST [NEEDS CLARIFICATION: mặt hàng nào theo serial, mặt hàng nào theo số lượng? Phần Chưa chốt chưa có câu trả lời.]
- **FR-007**: Đổi trả và bảo hành MUST [NEEDS CLARIFICATION: có nhập lại kho không, có giảm công nợ hoặc xuất hóa đơn điều chỉnh không? Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Thẻ bảo hành**: Mặt hàng, serial, khách, số điện thoại, hạn đang ghi trên thẻ.
- **Phiếu tiếp nhận**: Một thẻ, mô tả lỗi, trạng thái đang xử lý hoặc đã bàn giao.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 serial đã có thẻ đều tra ra đúng một thẻ. 10/10 serial không có đều báo không tìm thấy.
- **SC-002**: 10/10 thẻ mới hợp lệ đều có trong danh sách và tra được ngay sau khi lưu.
- **SC-003**: 10/10 phiếu có mô tả lỗi đều hiện trong danh sách phiếu với đúng serial.

## Assumptions

- Người dùng là nhân viên đã mở được màn bảo hành. Bảng quyền chỉ là đề xuất.
- Số tháng bảo hành trên dữ liệu mẫu không phải hạn đã chốt.
- Ngày bắt đầu hạn, hàng quản bằng serial và đổi trả được đánh dấu [NEEDS CLARIFICATION] ở FR-005 đến FR-007, chưa phải quy tắc.
- Hạn hiện trên thẻ là hạn nhân viên đọc được khi tra cứu.
