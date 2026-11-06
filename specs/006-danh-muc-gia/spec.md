# Feature Specification: Danh mục sản phẩm và giá

**Feature Branch**: `006-danh-muc-gia`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Danh mục sản phẩm và giá: xem, lọc, tìm mặt hàng không phải combo; xem giá vốn, giá lẻ, giá đại lý, giá dự án; thêm sản phẩm và xuất danh sách đang lọc."

## Clarifications

### Session 2026-11-06

- Q: Giá đại lý và giá nhà phân phối là hai cột hay một cột? → A: Hai cột. Giá đại lý và giá nhà phân phối đứng riêng.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tìm và xem mặt hàng (Priority: P1)

Nhân viên xem danh mục các mặt hàng không phải combo. Nhân viên lọc theo tất cả, thiết bị vệ sinh, nội thất phòng tắm hoặc vật tư xây dựng, và tìm theo mã, tên hoặc thương hiệu. Chọn một mặt hàng thì thấy danh mục, thương hiệu, xuất xứ, đơn vị, khối lượng, số tháng bảo hành đang ghi, mức tồn tối thiểu đang ghi, giá vốn, giá lẻ, giá đại lý, giá nhà phân phối và giá dự án.

**Why this priority**: Bán hàng và mua hàng đều tra mã và giá từ danh mục này.

**Independent Test**: Lọc một ngành, tìm một mã, mở chi tiết và đọc đủ bốn mức giá.

**Acceptance Scenarios**:

1. **Given** danh mục có hàng thuộc nhiều ngành, **When** nhân viên chọn một ngành, **Then** chỉ còn hàng ngành đó và không hiện combo.
2. **Given** nhân viên gõ một phần tên, **When** danh sách lọc, **Then** chỉ còn hàng khớp mã, tên hoặc thương hiệu trong ngành đang chọn.
3. **Given** một mặt hàng trong danh sách, **When** nhân viên mở chi tiết, **Then** thấy giá vốn, giá lẻ, giá đại lý, giá nhà phân phối và giá dự án của mặt hàng đó.

---

### User Story 2 - Thêm sản phẩm (Priority: P2)

Nhân viên thêm một mặt hàng với mã, tên, ngành, thương hiệu, đơn vị và các mức giá. Mặt hàng mới xuất hiện trong danh mục và trong bộ lọc đúng ngành.

**Why this priority**: Mã mới phải có trước khi lập đơn hoặc báo giá.

**Independent Test**: Thêm một mã ngành thiết bị vệ sinh và tìm lại được mã đó.

**Acceptance Scenarios**:

1. **Given** nhân viên mở phiếu thêm, **When** nhập mã chưa có, tên, ngành và lưu, **Then** mặt hàng xuất hiện khi lọc đúng ngành.
2. **Given** mã trùng một mặt hàng đang có, **When** nhân viên lưu, **Then** mặt hàng không được thêm.
3. **Given** tên hoặc mã đang trống, **When** nhân viên lưu, **Then** mặt hàng không được thêm.

---

### User Story 3 - Xuất danh sách đang lọc (Priority: P3)

Nhân viên xuất đúng các dòng đang hiện sau khi lọc và tìm, gồm mã, tên, ngành, thương hiệu, đơn vị và các mức giá.

**Why this priority**: Xuất bảng phục vụ gửi nội bộ sau khi đã xem đúng tập hàng.

**Independent Test**: Lọc một ngành, xuất, mở tệp và đối số dòng với màn hình.

**Acceptance Scenarios**:

1. **Given** bộ lọc đang để lại 4 mặt hàng, **When** nhân viên xuất, **Then** tệp có 4 dòng tương ứng, không thêm combo và không thêm hàng ngoài bộ lọc.

---

### Edge Cases

- Không có hàng khớp tìm kiếm: danh sách trống, nút xuất vẫn xuất bảng không có dòng hàng.
- Combo không xuất hiện trong danh mục này.
- Bấm hủy trên phiếu thêm: không tạo mặt hàng.
- Mức giá để trống khi lưu: phiếu không lưu cho đến khi có số ở các mức giá trên phiếu.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Danh mục MUST chỉ hiện mặt hàng không phải combo.
- **FR-002**: Nhân viên MUST lọc theo tất cả, thiết bị vệ sinh, nội thất phòng tắm hoặc vật tư xây dựng, và MUST tìm theo mã, tên hoặc thương hiệu.
- **FR-003**: Chi tiết một mặt hàng MUST hiện giá vốn, giá lẻ, giá đại lý, giá nhà phân phối và giá dự án, cùng đơn vị và ngành hàng. Giá nhà phân phối và giá đại lý MUST là hai mức.
- **FR-004**: Nhân viên MUST thêm mặt hàng khi có mã chưa trùng, tên và ngành. Mặt hàng mới MUST hiện ở đúng bộ lọc ngành.
- **FR-005**: Nhân viên MUST xuất đúng tập đang lọc.
- **FR-006**: Giá dùng lúc bán MUST [NEEDS CLARIFICATION: khóa theo hợp đồng, theo từng khách, hay lấy bảng giá hiện hành của kênh lẻ, đại lý, nhà phân phối hoặc dự án? Giá niêm yết đã gồm VAT chưa? Phần Chưa chốt chưa có câu trả lời.]
- **FR-007**: Ai được sửa bảng giá MUST [NEEDS CLARIFICATION: bảng quyền hiện chỉ là đề xuất. Khách chưa chốt ô nào được sửa giá.]

### Key Entities *(include if feature involves data)*

- **Mặt hàng**: Mã, tên, ngành, thương hiệu, đơn vị, giá vốn, giá lẻ, giá đại lý, giá nhà phân phối, giá dự án. Mã không trùng. Giá đại lý và giá nhà phân phối là hai mức.
- **Ngành hàng**: Thiết bị vệ sinh, nội thất phòng tắm, hoặc vật tư xây dựng trên màn này.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 10/10 lần lọc một ngành đều không còn hàng ngành khác và không còn combo.
- **SC-002**: 10/10 mặt hàng mới hợp lệ tìm lại được bằng mã ngay sau khi lưu.
- **SC-003**: 10/10 tệp xuất có số dòng bằng số dòng đang hiện trên màn hình.

## Assumptions

- Người dùng là nhân viên đã mở được danh mục. Bảng quyền chỉ là đề xuất.
- Số tháng bảo hành, mức tồn tối thiểu và giá trên dữ liệu mẫu không phải quy tắc.
- Giá dùng lúc bán và ai được sửa bảng giá được đánh dấu [NEEDS CLARIFICATION] ở FR-006 và FR-007, chưa phải quy tắc.
- Cách bán combo nằm ở spec combo. Cách giữ hàng khi bán nằm ở spec `001-reserve-sale-stock`.
- Nhà phân phối là loại khách thứ tư. Danh mục có một cột giá nhà phân phối, tách khỏi giá đại lý.
