# Feature Specification: Nhật ký hệ thống

**Feature Branch**: `014-nhat-ky`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Nhật ký: xem các thao tác đã ghi, lọc theo phân hệ, tìm theo người hoặc nội dung, và xuất đúng các dòng đang hiện."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Đọc nhật ký (Priority: P1)

Nhân viên mở nhật ký và thấy từng dòng với thời gian, người thực hiện, vai trò, phân hệ, hành động, địa điểm và mô tả. Dòng mới hơn đứng trước dòng cũ hơn. Nhân viên không sửa được một dòng đã hiện.

**Why this priority**: Nhật ký dùng để đọc lại việc đã xảy ra.

**Independent Test**: Mở màn và đọc đủ bảy cột trên dòng đầu. Thử sửa một ô và không sửa được.

**Acceptance Scenarios**:

1. **Given** đã có ít nhất hai dòng nhật ký, **When** nhân viên mở màn, **Then** mỗi dòng hiện thời gian, người, vai trò, phân hệ, hành động, địa điểm và mô tả.
2. **Given** hai dòng có thời gian khác nhau, **When** danh sách hiện, **Then** dòng thời gian muộn hơn đứng trên dòng sớm hơn.
3. **Given** một dòng đang hiện, **When** nhân viên bấm vào các ô của dòng, **Then** nội dung dòng không đổi.

---

### User Story 2 - Lọc và tìm (Priority: P2)

Nhân viên chọn một phân hệ hoặc tất cả phân hệ. Nhân viên gõ người thực hiện, hành động hoặc một phần mô tả. Danh sách chỉ còn dòng khớp cả phân hệ lẫn từ khóa. Số dòng đang hiện được ghi trên màn hình.

**Why this priority**: Nhật ký dài thì cần lọc trước khi đọc hoặc xuất.

**Independent Test**: Chọn phân hệ đơn hàng, gõ tên một người, và chỉ còn dòng đơn hàng của người đó.

**Acceptance Scenarios**:

1. **Given** nhật ký có nhiều phân hệ, **When** nhân viên chọn phân hệ đơn hàng, **Then** chỉ còn dòng phân hệ đó.
2. **Given** một phân hệ đang được chọn, **When** nhân viên gõ tên một người, **Then** chỉ còn dòng của người đó trong phân hệ đang chọn.
3. **Given** không có dòng khớp, **When** lọc xong, **Then** bảng trống và số dòng hiện bằng 0.
4. **Given** nhân viên chọn lại tất cả phân hệ và xóa từ khóa, **When** danh sách tải, **Then** thấy lại toàn bộ dòng.

---

### User Story 3 - Xuất các dòng đang hiện (Priority: P3)

Nhân viên xuất đúng các dòng đang hiện sau khi lọc. Tệp có thời gian, người, vai trò, phân hệ, hành động, địa điểm và mô tả.

**Why this priority**: Xuất phục vụ lưu hồ sơ sau khi đã lọc đúng tập dòng.

**Independent Test**: Lọc còn 3 dòng, xuất, mở tệp và thấy 3 dòng đó.

**Acceptance Scenarios**:

1. **Given** màn hình đang hiện 3 dòng, **When** nhân viên xuất, **Then** tệp có đúng 3 dòng với đủ bảy cột.
2. **Given** bộ lọc không ra dòng nào, **When** nhân viên xuất, **Then** tệp không có dòng dữ liệu.

---

### Edge Cases

- Nhật ký chưa có dòng: bảng trống, số dòng bằng 0, vẫn xuất được tệp không có dòng dữ liệu.
- Từ khóa khác hoa thường: vẫn khớp cùng một nội dung.
- Đổi phân hệ: từ khóa đang gõ vẫn được áp cùng lúc.
- Một dòng không có địa điểm: cột địa điểm để trống, dòng vẫn hiện.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mỗi dòng nhật ký MUST hiện thời gian, người thực hiện, vai trò, phân hệ, hành động, địa điểm và mô tả.
- **FR-002**: Dòng có thời gian muộn hơn MUST đứng trên dòng có thời gian sớm hơn.
- **FR-003**: Nhân viên MUST NOT sửa nội dung một dòng đã hiện.
- **FR-004**: Nhân viên MUST lọc theo một phân hệ hoặc tất cả phân hệ, và MUST tìm theo người, hành động hoặc mô tả. Hai điều kiện MUST áp dụng cùng lúc.
- **FR-005**: Màn hình MUST hiện số dòng đang khớp.
- **FR-006**: Nhân viên MUST xuất đúng các dòng đang hiện, đủ bảy cột.
- **FR-007**: Tập thao tác bắt buộc phải có dòng nhật ký MUST [NEEDS CLARIFICATION: những việc nào trên đơn, kho, mua hàng, công nợ và bảo hành bắt buộc ghi một dòng? Phần này chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Dòng nhật ký**: Thời gian, người thực hiện, vai trò, phân hệ, hành động, địa điểm, mô tả. Dòng đã hiện không sửa trên màn này.
- **Phân hệ**: Nhóm dòng nhân viên chọn khi lọc, gồm đơn hàng, tồn kho, chuyển kho, mua hàng, công nợ và bảo hành.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 lần mở nhật ký có dữ liệu đều đọc được bảy cột trên dòng đầu.
- **SC-002**: 10/10 lần lọc một phân hệ và một tên người đều chỉ còn dòng thỏa cả hai.
- **SC-003**: 10/10 tệp xuất có số dòng bằng số dòng đang hiện trên màn hình.

## Assumptions

- Người dùng là nhân viên đã mở được nhật ký. Bảng quyền chỉ là đề xuất. Spec này không chọn ai được xem nhật ký.
- Dữ liệu mẫu trong nhật ký không phải biên bản thật.
- Tập việc bắt buộc ghi nhật ký được đánh dấu [NEEDS CLARIFICATION] ở FR-007, chưa phải quy tắc.
- Các màn khác mô tả việc nhân viên làm. Màn này chỉ đọc và xuất dòng đã được ghi.
