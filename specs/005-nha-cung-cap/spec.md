# Feature Specification: Nhà cung cấp nhập khẩu

**Feature Branch**: `005-nha-cung-cap`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Nhà cung cấp nhập khẩu: xem hồ sơ nhà cung cấp, số đơn mua, và thêm nhà cung cấp mới để dùng khi lập đơn mua."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem hồ sơ nhà cung cấp (Priority: P1)

Nhân viên thấy từng nhà cung cấp với mã, tên, quốc gia, người liên hệ, điện thoại, email và tài khoản. Mỗi thẻ hiện số đơn mua và số lô chưa nhập kho.

**Why this priority**: Danh bạ là chỗ tra trước khi lập đơn mua.

**Independent Test**: Mở màn và đọc đủ các mục trên một thẻ đã có, gồm số đơn mua.

**Acceptance Scenarios**:

1. **Given** đã có ít nhất một nhà cung cấp, **When** nhân viên mở màn, **Then** thấy tên, mã, quốc gia và người liên hệ.
2. **Given** nhà cung cấp có đơn chưa nhập kho, **When** nhân viên xem thẻ, **Then** thấy số đơn mua và số lô chưa nhập kho.
3. **Given** nhà cung cấp không có lô đang về, **When** nhân viên xem thẻ, **Then** thẻ ghi không có lô đang về.

---

### User Story 2 - Thêm nhà cung cấp (Priority: P2)

Nhân viên mở phiếu thêm, nhập mã, tên, quốc gia, người liên hệ, điện thoại, email và tài khoản, rồi lưu. Thẻ mới xuất hiện trên màn. Nhà cung cấp đó chọn được khi lập đơn mua.

**Why this priority**: Đơn container cần một nhà cung cấp đã có trong danh bạ.

**Independent Test**: Thêm một nhà cung cấp với đủ mục bắt buộc, thấy thẻ mới, rồi mở phiếu mua hàng và chọn được tên đó.

**Acceptance Scenarios**:

1. **Given** nhân viên mở phiếu thêm, **When** nhập đủ các mục bắt buộc và lưu, **Then** thẻ mới hiện trên danh sách với đúng tên và mã.
2. **Given** một mục bắt buộc đang trống, **When** nhân viên lưu, **Then** nhà cung cấp không được thêm.
3. **Given** nhà cung cấp vừa lưu, **When** nhân viên mở phiếu tạo đơn mua, **Then** chọn được nhà cung cấp đó.

---

### Edge Cases

- Danh sách trống: màn vẫn có nút thêm nhà cung cấp.
- Trùng mã với một nhà cung cấp đang có: phiếu không lưu và báo mã đã có.
- Bấm hủy trên phiếu thêm: không tạo thẻ mới.
- Email không đúng dạng địa chỉ thư: phiếu không lưu.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST thấy mỗi nhà cung cấp với mã, tên, quốc gia, người liên hệ, điện thoại, email và tài khoản.
- **FR-002**: Mỗi thẻ MUST hiện số đơn mua và số lô chưa nhập kho. Nếu số lô chưa nhập bằng 0, thẻ MUST ghi không có lô đang về.
- **FR-003**: Nhân viên MUST thêm nhà cung cấp khi đủ mã, tên, quốc gia, người liên hệ, điện thoại, email và tài khoản.
- **FR-004**: Thiếu một mục bắt buộc, trùng mã, hoặc email không đúng dạng MUST NOT tạo nhà cung cấp.
- **FR-005**: Nhà cung cấp vừa lưu MUST xuất hiện trên danh sách và MUST chọn được khi lập đơn mua.
- **FR-006**: Bấm hủy MUST đóng phiếu và MUST NOT tạo nhà cung cấp.

### Key Entities *(include if feature involves data)*

- **Nhà cung cấp**: Mã, tên, quốc gia, người liên hệ, điện thoại, email, tài khoản. Mã không trùng trong danh bạ.
- **Đơn mua**: Việc mua gắn với một nhà cung cấp. Chi tiết đơn nằm ở spec mua hàng và container.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 nhà cung cấp đang có đều hiện đủ bảy mục hồ sơ trên thẻ.
- **SC-002**: 10/10 lần thêm đủ mục bắt buộc đều thấy thẻ mới và chọn được tên đó ở phiếu đơn mua ngay sau khi lưu.
- **SC-003**: 10/10 lần thiếu mục bắt buộc hoặc trùng mã đều không thêm thẻ mới.

## Assumptions

- Người dùng là nhân viên đã mở được màn nhà cung cấp. Bảng quyền chỉ là đề xuất.
- Ngoài phạm vi spec này: điều khoản thanh toán nhà cung cấp, tỷ giá và cách phân bổ chi phí.
- Số đơn trên thẻ đếm các đơn mua đang gắn với nhà cung cấp đó.
