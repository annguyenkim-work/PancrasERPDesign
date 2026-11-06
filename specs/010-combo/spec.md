# Feature Specification: Combo sản phẩm

**Feature Branch**: `010-combo`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Combo: xem bộ sản phẩm và các linh kiện, xem số linh kiện tại từng kho hoặc showroom, tạo combo mới từ các mặt hàng có sẵn."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem combo và linh kiện (Priority: P1)

Nhân viên thấy danh sách combo. Chọn một combo thì thấy tên bộ và từng linh kiện. Với mỗi linh kiện, nhân viên thấy số lượng trong bộ và số đang có tại từng kho hoặc showroom.

**Why this priority**: Người bán cần biết bộ gồm những gì trước khi tạo bộ mới.

**Independent Test**: Chọn một combo có từ hai linh kiện và đọc được tên từng linh kiện cùng số tại ít nhất một địa điểm.

**Acceptance Scenarios**:

1. **Given** có một combo nhiều linh kiện, **When** nhân viên chọn combo đó, **Then** thấy đủ các linh kiện và số lượng mỗi linh kiện trong bộ.
2. **Given** một linh kiện có ở một kho, **When** nhân viên xem combo, **Then** thấy số linh kiện đó tại kho đó.
3. **Given** chưa chọn combo, **When** nhân viên vừa mở màn, **Then** thấy danh sách combo để chọn.

---

### User Story 2 - Tạo combo (Priority: P2)

Nhân viên tạo combo: nhập tên bộ và thêm ít nhất hai mặt hàng có sẵn, mỗi mặt hàng một số lượng lớn hơn 0. Combo mới xuất hiện trong danh sách và mở ra thấy đúng các linh kiện vừa chọn.

**Why this priority**: Bộ mới phải có trong danh sách sau khi đã xem được bộ cũ.

**Independent Test**: Tạo một bộ hai mặt hàng và chọn lại bộ đó để đối linh kiện.

**Acceptance Scenarios**:

1. **Given** phiếu tạo đang mở, **When** nhân viên nhập tên và hai linh kiện có số lượng lớn hơn 0 rồi lưu, **Then** combo xuất hiện trong danh sách với đúng hai linh kiện.
2. **Given** phiếu chỉ có một linh kiện, **When** nhân viên lưu, **Then** combo không được tạo.
3. **Given** một linh kiện chưa có trong danh mục, **When** nhân viên lưu, **Then** combo không được tạo.

---

### Edge Cases

- Danh sách combo trống: màn vẫn có nút tạo combo.
- Số lượng linh kiện bằng 0: dòng đó không tính là một linh kiện hợp lệ.
- Chọn trùng một mặt hàng hai lần trong cùng bộ: phiếu không lưu cho đến khi mỗi mặt hàng chỉ còn một dòng.
- Bấm hủy: không tạo combo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST thấy danh sách combo và, khi chọn một combo, MUST thấy từng linh kiện với số lượng trong bộ.
- **FR-002**: Với mỗi linh kiện, nhân viên MUST thấy số đang có tại từng kho hoặc showroom.
- **FR-003**: Nhân viên MUST tạo combo từ các mặt hàng đã có trong danh mục, với tên bộ và ít nhất hai linh kiện, mỗi linh kiện một số lượng lớn hơn 0.
- **FR-004**: Combo vừa lưu MUST hiện trong danh sách với đúng các linh kiện đã chọn.
- **FR-005**: Một mặt hàng MUST NOT đứng hai dòng trong cùng một combo.
- **FR-006**: Cách trừ kho khi bán combo MUST [NEEDS CLARIFICATION: trừ từng linh kiện hay trừ một bộ đã đóng sẵn? Phần Chưa chốt chưa có câu trả lời.]
- **FR-007**: Giá vốn combo MUST [NEEDS CLARIFICATION: có cộng công đóng gói không? Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Combo**: Tên bộ và các linh kiện. Không phải một mặt hàng đơn trong danh mục giá.
- **Linh kiện**: Một mặt hàng đã có, với số lượng trong bộ.
- **Tồn linh kiện**: Số đang có của linh kiện tại một kho hoặc showroom.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 combo đang có, khi được chọn, đều hiện đủ số linh kiện đã lưu.
- **SC-002**: 10/10 combo mới hợp lệ đều tìm lại được trong danh sách với đúng các linh kiện.
- **SC-003**: 10/10 phiếu chỉ có một linh kiện đều không tạo combo.

## Assumptions

- Người dùng là nhân viên đã mở được màn combo. Bảng quyền chỉ là đề xuất.
- Số tồn trên demo không phải tồn thật.
- Cách trừ kho khi bán combo và giá vốn combo được đánh dấu [NEEDS CLARIFICATION] ở FR-006 và FR-007, chưa phải quy tắc.
- Quy tắc không bán âm và giữ hàng lúc ghi nhận đơn vẫn áp dụng cho hàng đơn lẻ theo spec `001-reserve-sale-stock`.
