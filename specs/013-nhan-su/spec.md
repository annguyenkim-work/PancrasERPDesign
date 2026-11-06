# Feature Specification: Nhân sự và phân quyền

**Feature Branch**: `013-nhan-su`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Nhân sự: xem và thêm hồ sơ nhân viên với vai trò và chi nhánh; xem bảng quyền đang hiện. Bảng quyền chỉ là đề xuất, chưa phải quyết định."

## Clarifications

### Session 2026-11-06

- Q: Ai được sửa đơn bán trước khi xuất chứng từ? → A: Kế toán, Giám đốc và Admin. Việc này đã chốt. Các ô còn lại trên bảng quyền vẫn là đề xuất.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem và lưu hồ sơ nhân viên (Priority: P1)

Nhân viên mở danh sách và thấy từng người với họ tên, chức vụ, phòng ban, chi nhánh và điện thoại. Người được phép sửa hồ sơ mở phiếu thêm hoặc sửa, nhập họ tên, email, điện thoại, vai trò, chức danh, phòng ban và chi nhánh, rồi lưu. Hồ sơ mới hoặc hồ sơ vừa sửa hiện trên danh sách.

**Why this priority**: Danh sách người dùng là việc chính của màn này.

**Independent Test**: Thêm một người với đủ họ tên và điện thoại, thấy thẻ mới đúng chi nhánh đã chọn.

**Acceptance Scenarios**:

1. **Given** đã có nhân viên, **When** mở danh sách, **Then** mỗi thẻ hiện họ tên, chức vụ, phòng ban, chi nhánh và điện thoại.
2. **Given** phiếu thêm đang mở, **When** nhập họ tên, điện thoại, vai trò và một chi nhánh rồi lưu, **Then** thẻ mới hiện đúng các mục đó.
3. **Given** họ tên hoặc điện thoại đang trống, **When** lưu, **Then** hồ sơ không được ghi.
4. **Given** đang sửa một người, **When** đổi chi nhánh và lưu, **Then** thẻ hiện chi nhánh mới.

---

### User Story 2 - Xem bảng quyền đề xuất (Priority: P2)

Nhân viên mở bảng quyền và thấy các dòng việc cùng các cột vai trò. Ô đang ghi Có hoặc Không là đề xuất trên demo. Màn hình không coi các ô đó là quyền đã duyệt. Nhân viên không sửa được từng ô thành quyết định từ bảng này cho đến khi khách chốt.

**Why this priority**: Bảng phải xem được, nhưng không được biến đề xuất thành quy tắc.

**Independent Test**: Mở bảng, thấy các cột vai trò, và không có thao tác nào biến một ô đề xuất thành quyền đã chốt.

**Acceptance Scenarios**:

1. **Given** nhân viên mở bảng quyền, **When** bảng hiện, **Then** thấy các dòng việc và các cột vai trò đang có trên demo.
2. **Given** một ô đang ghi Có hoặc Không, **When** nhân viên xem ô đó, **Then** màn hình thể hiện đây là đề xuất, không phải quyền đã chốt.
3. **Given** khách chưa điền quyết định cho các ô còn lại, **When** nhân viên chỉ xem bảng, **Then** không có quyền mới được ghi nhận từ các ô đề xuất. Việc sửa đơn bán trước khi xuất chứng từ vẫn theo quyết định đã chốt cho Kế toán, Giám đốc và Admin.

---

### Edge Cases

- Danh sách nhân viên trống: vẫn có đường thêm người nếu người đang dùng được sửa hồ sơ.
- Email không đúng dạng: phiếu không lưu.
- Đóng phiếu bằng hủy: không ghi thay đổi.
- Người đang dùng không được sửa hồ sơ: không thấy nút thêm nhân viên. Ai được sửa vẫn là câu hỏi của bảng quyền.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Danh sách MUST hiện họ tên, chức vụ, phòng ban, chi nhánh và điện thoại của từng nhân viên.
- **FR-002**: Phiếu hồ sơ MUST lưu được khi có họ tên và điện thoại, cùng vai trò, chức danh, phòng ban và chi nhánh đã nhập.
- **FR-003**: Thiếu họ tên, thiếu điện thoại, hoặc email không đúng dạng MUST NOT ghi hồ sơ.
- **FR-004**: Hồ sơ vừa lưu MUST hiện trên danh sách với chi nhánh đã chọn.
- **FR-005**: Bảng quyền MUST hiện các dòng việc và cột vai trò. Mọi ô Có hoặc Không trên bảng MUST được thể hiện là đề xuất, không phải quyền đã duyệt.
- **FR-006**: Vai trò và từng ô quyền còn lại MUST [NEEDS CLARIFICATION: khách muốn thêm hoặc bớt vai trò nào, và muốn đổi ô nào so với bảng đề xuất? Phần Chưa chốt chưa có câu trả lời.]
- **FR-007**: Việc sửa đơn bán trước khi xuất chứng từ MUST cho phép Kế toán, Giám đốc và Admin sửa, theo spec `008-ban-hang`. Các vai còn lại trên việc này MUST [NEEDS CLARIFICATION: có được sửa không? Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Nhân viên**: Họ tên, điện thoại, email, vai trò đang ghi, chức danh, phòng ban, chi nhánh.
- **Bảng quyền đề xuất**: Các dòng việc và cột vai trò. Ô trên bảng chưa phải quyết định.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 nhân viên đang có đều hiện đủ họ tên, chi nhánh và điện thoại trên thẻ.
- **SC-002**: 10/10 hồ sơ mới hợp lệ đều xuất hiện đúng chi nhánh ngay sau khi lưu.
- **SC-003**: 10/10 lần mở bảng quyền đều không ghi nhận thêm một quyền đã chốt nào từ các ô đề xuất. Quyền sửa đơn trước khi xuất chứng từ của Kế toán, Giám đốc và Admin không tính vào các ô đề xuất đó.

## Assumptions

- Bảng quyền trên demo chỉ là đề xuất. Việc thêm bớt vai trò và đổi từng ô còn lại được đánh dấu [NEEDS CLARIFICATION] ở FR-006, chưa phải quy tắc.
- Một việc đã chốt nằm ở FR-007: Kế toán, Giám đốc và Admin được sửa đơn bán trước khi xuất chứng từ. Các vai còn lại trên việc này chưa phải quy tắc.
- Người không thấy nút thêm nhân viên là người màn hình đang giấu nút đó. Việc giấu nút trên demo không phải ma trận đã duyệt.
- Spec này không quy định lương, chấm công hay doanh số theo nhân viên.
