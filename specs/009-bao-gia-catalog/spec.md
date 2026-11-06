# Feature Specification: Báo giá và catalog

**Feature Branch**: `009-bao-gia-catalog`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Báo giá và Catalog: chọn kênh lẻ, đại lý hoặc dự án; nhập khách, hiệu lực và chiết khấu; thêm dòng hàng; tạo catalog để xem và tải về."

## Clarifications

### Session 2026-11-06

- Q: Kênh nhà phân phối và kênh đại lý là hai kênh hay một kênh? → A: Hai kênh. Nhà phân phối là loại khách thứ tư.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Soạn báo giá (Priority: P1)

Nhân viên chọn kênh giá lẻ, đại lý, nhà phân phối hoặc dự án. Nhân viên nhập tên khách, điện thoại, địa chỉ, ngày hiệu lực và mức chiết khấu. Nhân viên thêm từng mặt hàng và số lượng. Với kênh đại lý, nhà phân phối hoặc dự án, nhân viên có thể chọn một khách trong danh bạ cùng kênh để điền tên và mức chiết khấu đang ghi trên hồ sơ khách đó.

**Why this priority**: Chưa có dòng hàng và khách thì chưa có báo giá để xuất.

**Independent Test**: Chọn kênh nhà phân phối, chọn một khách nhà phân phối, thêm một mặt hàng và thấy tên khách cùng dòng hàng trên phiếu.

**Acceptance Scenarios**:

1. **Given** nhân viên đang ở màn báo giá, **When** chọn kênh dự án, **Then** phiếu ghi kênh dự án.
2. **Given** kênh nhà phân phối và một khách nhà phân phối trong danh bạ, **When** nhân viên chọn khách đó, **Then** tên khách và mức chiết khấu trên phiếu lấy từ hồ sơ khách. Khách đại lý không được chọn ở kênh này.
3. **Given** phiếu đang soạn, **When** nhân viên nhập một mức chiết khấu và thêm một mặt hàng với số lượng lớn hơn 0, **Then** phiếu hiện mức chiết khấu đó và dòng hàng đó.
4. **Given** kênh lẻ, **When** nhân viên xem phiếu, **Then** không có ô lấy hồ sơ khách đại lý, nhà phân phối hoặc dự án.

---

### User Story 2 - Tạo catalog (Priority: P2)

Nhân viên bấm tạo catalog. Một bản xem hiện ra và một tệp được tải về. Bản xem có tên khách, kênh giá, ngày lập, ngày hiệu lực, từng dòng với số lượng và thành tiền, cùng tổng tiền.

**Why this priority**: Catalog là kết quả gửi khách sau khi đã soạn dòng.

**Independent Test**: Soạn một dòng, tạo catalog, thấy tên khách và dòng đó trên bản xem.

**Acceptance Scenarios**:

1. **Given** phiếu có tên khách, ngày hiệu lực và ít nhất một dòng, **When** nhân viên tạo catalog, **Then** bản xem hiện tên khách, kênh, ngày lập, ngày hiệu lực, từng dòng và tổng tiền, và một tệp được tải về.
2. **Given** phiếu chưa có tên khách hoặc chưa có dòng hàng, **When** nhân viên tạo catalog, **Then** catalog không được tạo.
3. **Given** catalog vừa tạo, **When** nhân viên đóng bản xem, **Then** phiếu soạn vẫn còn các dòng đã nhập.

---

### Edge Cases

- Số lượng dòng bằng 0: dòng không đưa vào catalog.
- Đổi kênh sau khi đã chọn khách: khách không thuộc kênh mới thì tên lấy từ danh bạ được bỏ, nhân viên nhập lại.
- Kênh đại lý chỉ chọn được khách đại lý. Kênh nhà phân phối chỉ chọn được khách nhà phân phối. Khách khác loại không hiện trong ô đó.
- Ngày hiệu lực để trống: catalog vẫn tạo nếu đã có tên khách và dòng hàng, và bản xem không ghi một ngày hiệu lực giả.
- Xóa hết dòng: không tạo được catalog.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST chọn kênh lẻ, đại lý, nhà phân phối hoặc dự án. Kênh nhà phân phối và kênh đại lý MUST là hai kênh.
- **FR-002**: Với kênh đại lý, nhà phân phối hoặc dự án, nhân viên MUST chọn được một khách cùng kênh để điền tên và mức chiết khấu đang ghi trên hồ sơ khách.
- **FR-003**: Nhân viên MUST thêm dòng hàng với số lượng lớn hơn 0 và MUST nhập mức chiết khấu trên phiếu.
- **FR-004**: Catalog chỉ được tạo khi có tên khách và ít nhất một dòng số lượng lớn hơn 0.
- **FR-005**: Bản xem catalog MUST hiện tên khách, kênh giá, ngày lập, ngày hiệu lực nếu đã nhập, từng dòng và tổng tiền. Nhân viên MUST tải được bản đó.
- **FR-006**: Hiệu lực và số lần sửa báo giá MUST [NEEDS CLARIFICATION: báo giá hiệu lực bao lâu và sửa được mấy lần? Phần Chưa chốt chưa có câu trả lời.]
- **FR-007**: Giá khi chuyển báo giá thành đơn MUST [NEEDS CLARIFICATION: giữ giá đã báo hay lấy giá mới? Phần Chưa chốt chưa có câu trả lời.]
- **FR-008**: Thuế trên catalog MUST [NEEDS CLARIFICATION: thuế suất nào, hàng nào không chịu thuế, giá niêm yết đã gồm VAT chưa? Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Báo giá**: Kênh giá lẻ, đại lý, nhà phân phối hoặc dự án, khách, ngày hiệu lực, mức chiết khấu, các dòng hàng.
- **Dòng báo giá**: Mặt hàng và số lượng.
- **Catalog**: Bản xem và tệp tải về của một báo giá vừa tạo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 lần chọn khách nhà phân phối đều điền đúng tên khách đó lên phiếu.
- **SC-002**: 10/10 catalog tạo từ phiếu hợp lệ đều hiện đủ số dòng đã soạn và đúng tên khách.
- **SC-003**: 10/10 phiếu thiếu tên khách hoặc thiếu dòng đều không tạo catalog.

## Assumptions

- Người dùng là nhân viên đã mở được màn báo giá. Bảng quyền chỉ là đề xuất.
- Số thuế và số tiền trên bản xem mẫu không phải thuế suất hay giá đã chốt.
- Spec này không tạo đơn bán. Nhân viên có thể đưa tệp báo giá vừa tạo sang form lập đơn ở spec `008-ban-hang`. Việc giữ hàng khi ghi nhận đơn nằm ở spec `001-reserve-sale-stock`.
- Hiệu lực, giá khi chuyển thành đơn và thuế được đánh dấu [NEEDS CLARIFICATION] ở FR-006 đến FR-008, chưa phải quy tắc.
- Giá hiện trên phiếu là giá của kênh đang chọn, để nhân viên đọc lúc soạn.
- Nhà phân phối là kênh giá riêng, không gộp với kênh đại lý.
