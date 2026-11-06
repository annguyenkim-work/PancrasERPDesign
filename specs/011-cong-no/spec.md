# Feature Specification: Công nợ và hạn mức

**Feature Branch**: `011-cong-no`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Công nợ: xem dư nợ đại lý và khách dự án, xuất báo cáo, ghi một khoản thu, và sửa hạn mức cùng kỳ hạn của một khách."

## Clarifications

### Session 2026-11-06

- Q: Công nợ nhà phân phối và công nợ đại lý là hai nhóm hay một nhóm? → A: Hai nhóm. Khách lẻ vẫn không nằm trong màn này. Khách nhà phân phối có dư nợ, hạn mức và kỳ hạn như khách đại lý.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem dư nợ (Priority: P1)

Nhân viên thấy tổng dư nợ, tổng hạn mức đang cấp, và danh sách khách đại lý, khách nhà phân phối cùng khách dự án. Mỗi dòng hiện tên, mã, loại khách, dư nợ, hạn mức và kỳ hạn. Nhân viên tìm theo tên hoặc mã.

**Why this priority**: Màn này dùng để biết ai đang nợ trước khi thu tiền.

**Independent Test**: Mở màn, đọc tổng dư nợ và tìm một mã khách đã có.

**Acceptance Scenarios**:

1. **Given** có khách đại lý, khách nhà phân phối và khách dự án đang nợ, **When** nhân viên mở màn, **Then** thấy tổng dư nợ và từng khách với loại, dư nợ, hạn mức, kỳ hạn. Khách nhà phân phối không hiện thành khách đại lý.
2. **Given** nhân viên gõ một mã khách, **When** danh sách lọc, **Then** chỉ còn khách khớp tên hoặc mã.
3. **Given** không có khách khớp, **When** tìm xong, **Then** danh sách trống và tổng trên đầu màn vẫn là tổng của toàn bộ khách nợ, không phải tổng của bộ lọc trống.
4. **Given** tìm kiếm đang để lại 2 khách, **When** nhân viên xuất báo cáo, **Then** tệp có đúng 2 khách đó, mỗi dòng có dư nợ và hạn mức.

---

### User Story 2 - Ghi nhận một khoản thu (Priority: P2)

Nhân viên chọn một khách, nhập số tiền thu và lưu. Sau khi lưu, dư nợ của khách đó trên danh sách giảm đúng số tiền vừa nhập nếu số tiền không lớn hơn dư nợ đang hiện. Phiếu thu hiện tên khách và số tiền.

**Why this priority**: Thu tiền là việc chính sau khi đã thấy nợ.

**Independent Test**: Với một khách đang nợ, ghi một khoản nhỏ hơn dư nợ và thấy dư nợ giảm đúng khoản đó.

**Acceptance Scenarios**:

1. **Given** một khách có dư nợ lớn hơn 0, **When** nhân viên nhập một khoản thu nhỏ hơn hoặc bằng dư nợ và lưu, **Then** dư nợ trên dòng khách giảm đúng số tiền đó.
2. **Given** phiếu thu đang mở, **When** nhân viên để số tiền bằng 0 hoặc trống, **Then** khoản thu không được ghi.
3. **Given** nhân viên bấm hủy, **When** phiếu đóng, **Then** dư nợ không đổi.

---

### User Story 3 - Sửa hạn mức và kỳ hạn (Priority: P3)

Nhân viên mở phiếu hạn mức của một khách, sửa hạn mức và số ngày kỳ hạn, rồi lưu. Dòng khách hiện hạn mức và kỳ hạn mới.

**Why this priority**: Hạn mức là hồ sơ trên cùng màn nợ, sau khi đã xem và thu được tiền.

**Independent Test**: Đổi hạn mức của một khách, lưu, và thấy số mới trên dòng đó.

**Acceptance Scenarios**:

1. **Given** một khách nhà phân phối, **When** nhân viên lưu hạn mức và kỳ hạn mới, **Then** dòng khách hiện hai số mới và vẫn là loại nhà phân phối.
2. **Given** hạn mức nhập nhỏ hơn 0, **When** nhân viên lưu, **Then** hạn mức không đổi.

---

### Edge Cases

- Khách lẻ không nằm trong danh sách nợ của màn này.
- Khoản thu lớn hơn dư nợ đang hiện: [NEEDS CLARIFICATION: từ chối khoản thu, hay ghi phần thừa thành tiền ứng trước?]
- Xuất báo cáo: tệp có các khách đang hiện sau khi tìm, gồm dư nợ và hạn mức.
- Không có khách nợ: tổng dư nợ hiện 0 và danh sách trống.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Màn MUST hiện tổng dư nợ của khách đại lý, khách nhà phân phối và khách dự án, cùng tổng hạn mức đang cấp. Nhà phân phối và đại lý MUST là hai nhóm.
- **FR-002**: Mỗi dòng MUST hiện tên, mã, loại khách, dư nợ, hạn mức và kỳ hạn. Nhân viên MUST tìm theo tên hoặc mã.
- **FR-003**: Với khoản thu lớn hơn 0 và không lớn hơn dư nợ đang hiện, dư nợ trên dòng MUST giảm đúng số tiền đó. Khoản lớn hơn dư nợ đang hiện là [NEEDS CLARIFICATION: từ chối ghi, hay nhận phần thừa thành tiền ứng trước? Phần Chưa chốt chưa có câu trả lời.]
- **FR-004**: Nhân viên MUST sửa hạn mức và kỳ hạn của một khách đại lý, khách nhà phân phối hoặc khách dự án. Hạn mức nhỏ hơn 0 MUST NOT được lưu.
- **FR-005**: Nhân viên MUST xuất được các khách đang hiện sau khi tìm.
- **FR-006**: Thời điểm dư nợ bị chiếm MUST [NEEDS CLARIFICATION: từ lúc đơn chờ duyệt hay chỉ khi đơn đã duyệt? Phần Chưa chốt chưa có câu trả lời.]
- **FR-007**: Cách khóa đơn vì nợ MUST [NEEDS CLARIFICATION: khóa khi quá hạn, khi vượt hạn mức, hay cả hai? Quá hạn tính từ ngày nào? Phần Chưa chốt chưa có câu trả lời.]
- **FR-008**: Cách ghi một khoản trả MUST [NEEDS CLARIFICATION: phân vào đơn nào, có nhận tiền thừa thành tiền ứng trước không, trả hết thì mở khóa tự động hay kế toán mở tay? Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Khách nợ**: Khách đại lý, khách nhà phân phối hoặc khách dự án, có dư nợ, hạn mức và kỳ hạn đang hiện.
- **Khoản thu**: Một số tiền nhân viên ghi cho một khách nợ.
- **Hạn mức**: Số trần và số ngày kỳ hạn đang ghi trên hồ sơ khách.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 lần tìm đúng mã đều ra một khách và hiện dư nợ của khách đó.
- **SC-002**: 10/10 khoản thu hợp lệ đều làm dư nợ giảm đúng số tiền đã nhập.
- **SC-003**: 10/10 lần lưu hạn mức hợp lệ đều thấy số mới trên dòng khách ngay sau khi đóng phiếu.

## Assumptions

- Người dùng là nhân viên đã mở được màn công nợ. Bảng quyền chỉ là đề xuất. Spec này không chọn ai được thu tiền hay sửa hạn mức.
- Số nợ trên dữ liệu mẫu không phải dư nợ thật.
- Thời điểm chiếm nợ, cách khóa đơn và cách ghi khoản trả được đánh dấu [NEEDS CLARIFICATION] ở FR-006 đến FR-008, chưa phải quy tắc.
- Màn này hiện khách đại lý, khách nhà phân phối và khách dự án. Nhà phân phối và đại lý là hai nhóm. Khách lẻ không nằm trong màn này.
- Giữ hàng khi bán không đổi vì một khoản thu. Quy tắc giữ hàng nằm ở spec `001-reserve-sale-stock`.
