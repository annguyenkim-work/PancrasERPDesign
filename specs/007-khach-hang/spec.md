# Feature Specification: Danh bạ khách hàng

**Feature Branch**: `007-khach-hang`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Danh bạ khách hàng: xem khách lẻ, đại lý và dự án; tìm theo tên, mã, số điện thoại; thêm khách; sửa đợt bàn giao của khách dự án; xuất danh sách đang lọc."

## Clarifications

### Session 2026-11-06

- Q: Nhà phân phối có phải loại khách thứ tư không? → A: Có. Bốn loại là lẻ, đại lý, nhà phân phối và dự án. Nhà phân phối có hạn mức, kỳ hạn, chiết khấu và dư nợ như đại lý. Đợt bàn giao vẫn chỉ của khách dự án.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tìm khách (Priority: P1)

Nhân viên thấy danh sách khách với tên, loại lẻ, đại lý, nhà phân phối hoặc dự án, chiết khấu đang ghi, hạn mức, dư nợ và kỳ hạn. Nhân viên tìm theo tên, mã hoặc số điện thoại.

**Why this priority**: Lập đơn và xem nợ đều bắt đầu từ việc tìm đúng khách.

**Independent Test**: Gõ một số điện thoại đã có và chỉ còn khách khớp.

**Acceptance Scenarios**:

1. **Given** danh bạ có cả bốn loại khách, **When** nhân viên mở màn, **Then** mỗi dòng hiện loại khách, hạn mức, dư nợ và kỳ hạn.
2. **Given** nhân viên gõ một phần tên hoặc số điện thoại, **When** danh sách lọc, **Then** chỉ còn khách khớp tên, mã hoặc số điện thoại.
3. **Given** không có khách khớp, **When** tìm xong, **Then** danh sách trống.
4. **Given** tìm kiếm đang để lại 2 khách, **When** nhân viên xuất danh sách, **Then** tệp có đúng 2 khách đó.

---

### User Story 2 - Thêm khách (Priority: P2)

Nhân viên thêm khách với tên, điện thoại, email và địa chỉ. Với đại lý và với nhà phân phối, phiếu có thêm hạn mức, kỳ hạn và chiết khấu đang nhập. Với dự án, phiếu có thêm tên dự án và giá trị hợp đồng đang nhập. Khách mới xuất hiện trong danh sách đúng loại.

**Why this priority**: Khách chưa có trong danh bạ thì chưa chọn được lúc lập đơn.

**Independent Test**: Thêm một khách đại lý, một khách nhà phân phối và một khách dự án, tìm lại được cả ba.

**Acceptance Scenarios**:

1. **Given** phiếu thêm đang mở, **When** nhân viên nhập đủ tên và điện thoại rồi lưu, **Then** khách xuất hiện trong danh sách.
2. **Given** tên hoặc điện thoại đang trống, **When** nhân viên lưu, **Then** khách không được thêm.
3. **Given** nhân viên chọn loại dự án và nhập tên dự án, **When** lưu, **Then** dòng khách mới hiện loại dự án.
4. **Given** nhân viên chọn loại nhà phân phối và nhập hạn mức, kỳ hạn, chiết khấu, **When** lưu, **Then** dòng khách mới hiện loại nhà phân phối, không hiện loại đại lý.

---

### User Story 3 - Sửa đợt bàn giao của dự án (Priority: P3)

Với khách dự án, nhân viên mở các đợt bàn giao. Mỗi đợt có tên, ngày bàn giao và ít nhất một dòng hàng. Lưu xong, mở lại vẫn thấy các đợt vừa lưu.

**Why this priority**: Đợt bàn giao gắn với khách dự án, sau khi hồ sơ khách đã có.

**Independent Test**: Thêm một đợt có tên, ngày và một mặt hàng, lưu, mở lại và thấy đúng đợt đó.

**Acceptance Scenarios**:

1. **Given** một khách dự án, **When** nhân viên thêm một đợt đủ tên, ngày và một dòng hàng rồi lưu, **Then** mở lại vẫn thấy đợt đó.
2. **Given** một đợt chưa có tên hoặc chưa có ngày hoặc chưa có dòng hàng, **When** nhân viên lưu, **Then** thay đổi đợt không được ghi.

---

### Edge Cases

- Khách lẻ không có hạn mức: dòng hạn mức của khách lẻ không hiện như một hạn mức của đại lý hay nhà phân phối.
- Xóa hết dòng hàng của một đợt: đợt đó không lưu được.
- Bấm hủy: phiếu đóng và không ghi thay đổi đang nhập.
- Xuất danh sách: tệp chỉ có các khách đang hiện sau khi tìm.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST thấy loại khách, chiết khấu đang ghi, hạn mức, dư nợ và kỳ hạn trên danh sách. Loại khách MUST là lẻ, đại lý, nhà phân phối hoặc dự án. Bốn loại MUST tách riêng.
- **FR-002**: Nhân viên MUST tìm theo tên, mã hoặc số điện thoại.
- **FR-003**: Nhân viên MUST thêm khách khi có tên và điện thoại. Thiếu một trong hai mục đó MUST NOT tạo khách.
- **FR-004**: Khách vừa thêm MUST hiện đúng loại đã chọn.
- **FR-005**: Với khách dự án, nhân viên MUST thêm và sửa đợt bàn giao. Một đợt chỉ lưu khi có tên, ngày và ít nhất một dòng hàng.
- **FR-006**: Nhân viên MUST xuất đúng các khách đang hiện sau khi tìm.
- **FR-007**: Cơ cấu hồ sơ dự án MUST [NEEDS CLARIFICATION: một chủ đầu tư có nhiều hợp đồng và nhiều công trình không? Ai nhập số hợp đồng và phụ lục? Phần Chưa chốt chưa có câu trả lời.]
- **FR-008**: Phạm vi khách nhân viên nhìn thấy MUST [NEEDS CLARIFICATION: nhân viên kinh doanh chỉ thấy khách của mình hay thấy chung? Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Khách hàng**: Tên, điện thoại, loại lẻ, đại lý, nhà phân phối hoặc dự án. Đại lý, nhà phân phối và dự án có hạn mức, dư nợ và kỳ hạn đang ghi trên hồ sơ. Đợt bàn giao và giá trị hợp đồng chỉ thuộc khách dự án.
- **Đợt bàn giao**: Thuộc một khách dự án. Có tên, ngày và các dòng hàng.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 lần tìm bằng số điện thoại đã có đều chỉ ra khách khớp.
- **SC-002**: 10/10 khách mới hợp lệ tìm lại được ngay sau khi lưu.
- **SC-003**: 10/10 đợt dự án hợp lệ còn đủ tên, ngày và dòng hàng khi mở lại.

## Assumptions

- Người dùng là nhân viên đã mở được danh bạ. Bảng quyền chỉ là đề xuất.
- Mức chiết khấu, hạn mức và số nợ trên dữ liệu mẫu không phải quy tắc.
- Hồ sơ nhiều hợp đồng và phạm vi khách nhân viên nhìn thấy được đánh dấu [NEEDS CLARIFICATION] ở FR-007 và FR-008, chưa phải quy tắc.
- Cách khóa nợ, cách ghi doanh số và cách thu theo đợt: [NEEDS CLARIFICATION: các câu này nằm ở spec công nợ, tổng quan và bán hàng, chưa có câu trả lời.]
- Giữ hàng khi bán nằm ở spec `001-reserve-sale-stock`.
- Có bốn loại khách: lẻ, đại lý, nhà phân phối, dự án. Nhà phân phối không gộp vào đại lý. Hồ sơ hạn mức, kỳ hạn và chiết khấu của nhà phân phối cùng dạng với đại lý. Đợt bàn giao chỉ của khách dự án.
