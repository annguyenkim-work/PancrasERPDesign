# Feature Specification: Kho và điều chuyển

**Feature Branch**: `003-kho-dieu-chuyen`

**Created**: 2026-11-05

**Status**: Draft

**Input**: User description: "Màn Quản lý Kho và Điều chuyển: tra cứu tồn theo kho và showroom, lập phiếu chuyển, xác nhận đã nhận, lập kiểm kê và điều chỉnh tồn. Tồn không được âm."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tra cứu tồn (Priority: P1)

Nhân viên tìm hàng theo mã, tên hoặc thương hiệu, lọc theo địa điểm và ngành hàng. Mỗi dòng hiện tồn thực tế, đang giữ chỗ, khả dụng và đang chuyển, cùng tồn tại từng kho hoặc showroom. Khả dụng không hiện dưới 0.

**Why this priority**: Mọi việc kho bắt đầu từ việc nhìn đúng số tại đúng địa điểm.

**Independent Test**: Tìm một mặt hàng có ở nhiều địa điểm và đọc được bốn cột số cùng tồn từng điểm.

**Acceptance Scenarios**:

1. **Given** một mặt hàng có tồn ở một kho và một showroom, **When** nhân viên mở tra cứu, **Then** thấy tồn, đang giữ, khả dụng và đang chuyển, cùng số tại từng địa điểm.
2. **Given** danh sách nhiều mặt hàng, **When** nhân viên gõ một phần mã hoặc tên, **Then** chỉ còn các dòng khớp.
3. **Given** nhân viên chọn một địa điểm, **When** bảng tải lại, **Then** chỉ còn hàng của địa điểm đó.
4. **Given** khả dụng của một dòng bằng 0, **When** nhân viên xem cột khả dụng, **Then** số hiện 0 và không hiện số âm.
5. **Given** nhân viên chọn một ngành hàng, **When** bảng tải lại, **Then** chỉ còn hàng của ngành đó.
6. **Given** bộ lọc đang để lại 3 dòng, **When** nhân viên xuất bảng tồn, **Then** tệp có đúng 3 dòng với tồn thực tế, đang giữ chỗ, khả dụng và đang chuyển.

---

### User Story 2 - Chuyển hàng giữa hai địa điểm (Priority: P2)

Nhân viên lập phiếu chuyển: chọn nơi xuất, nơi nhận, các dòng hàng và số lượng, rồi ghi chú. Phiếu xuất hiện trong danh sách chuyển. Nhân viên xác nhận đã nhận thì phiếu không còn ở trạng thái đang chuyển.

**Why this priority**: Hàng đi giữa kho và showroom là việc kế tiếp sau khi đã thấy tồn.

**Independent Test**: Tạo một phiếu từ kho này sang showroom kia, thấy phiếu đang chuyển, rồi xác nhận đã nhận.

**Acceptance Scenarios**:

1. **Given** nhân viên đang ở màn kho, **When** lập phiếu với nơi xuất, nơi nhận và ít nhất một dòng có số lượng, **Then** phiếu xuất hiện trong danh sách chuyển.
2. **Given** một phiếu đang chuyển, **When** nhân viên xác nhận đã nhận hàng, **Then** phiếu không còn là đang chuyển.
3. **Given** nơi xuất và nơi nhận trùng nhau, **When** nhân viên lưu phiếu, **Then** phiếu không được tạo.

---

### User Story 3 - Kiểm kê và điều chỉnh (Priority: P3)

Nhân viên lập biên bản kiểm kê cho một địa điểm: chọn hàng, nhập số đếm và lý do chênh lệch. Biên bản hiện tồn sổ, tồn đếm và chênh lệch. Nhân viên cũng mở được điều chỉnh trực tiếp cho một mặt hàng tại một địa điểm. Kết quả sau điều chỉnh không làm tồn xuống dưới 0.

**Why this priority**: Kiểm kê sửa số sau khi tra cứu và chuyển kho đã có.

**Independent Test**: Lập một biên bản với số đếm khác tồn sổ, thấy chênh lệch. Điều chỉnh một dòng và thấy tồn mới không âm.

**Acceptance Scenarios**:

1. **Given** một mặt hàng tại một địa điểm, **When** nhân viên nhập số đếm khác tồn sổ và một lý do, **Then** biên bản hiện tồn sổ, tồn đếm và chênh lệch.
2. **Given** một biên bản đã lập, **When** nhân viên phê duyệt điều chỉnh, **Then** biên bản không còn chờ phê duyệt.
3. **Given** tồn tại một địa điểm là 2, **When** nhân viên điều chỉnh trực tiếp làm tồn xuống dưới 0, **Then** lần điều chỉnh đó không được ghi và tồn vẫn không âm.

---

### Edge Cases

- Tìm không ra hàng: bảng trống và có lời nhắn không có kết quả.
- Phiếu chuyển không có dòng hàng: phiếu không được tạo.
- Số đếm bằng tồn sổ: chênh lệch hiện 0.
- Điều chỉnh với lý do để trống: phiếu điều chỉnh trực tiếp không lưu.
- Xem lịch sử một mặt hàng: nhân viên lọc theo địa điểm và thấy các dòng nhập, xuất, chuyển, điều chỉnh của mặt hàng đó.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Nhân viên MUST tra cứu hàng theo mã, tên hoặc thương hiệu, và MUST lọc theo một địa điểm hoặc toàn bộ địa điểm, theo ngành hàng.
- **FR-002**: Mỗi dòng MUST hiện tồn thực tế, đang giữ chỗ, khả dụng và đang chuyển. Khả dụng MUST NOT hiện dưới 0.
- **FR-003**: Nhân viên MUST thấy tồn của mặt hàng tại từng kho hoặc showroom.
- **FR-004**: Nhân viên MUST lập phiếu chuyển với nơi xuất, nơi nhận khác nơi xuất, ít nhất một dòng và số lượng lớn hơn 0.
- **FR-005**: Phiếu đang chuyển MUST có thao tác xác nhận đã nhận. Sau xác nhận, phiếu MUST NOT còn ở trạng thái đang chuyển.
- **FR-006**: Nhân viên MUST lập biên bản kiểm kê với địa điểm, mặt hàng, số đếm và lý do, và MUST thấy tồn sổ, tồn đếm, chênh lệch.
- **FR-007**: Điều chỉnh tồn MUST NOT làm tồn tại địa điểm đó xuống dưới 0.
- **FR-008**: Nhân viên MUST xuất được bảng tồn đang lọc.
- **FR-009**: Khi nhân viên xác nhận phê duyệt một biên bản đang chờ, biên bản MUST không còn trạng thái chờ phê duyệt.
- **FR-010**: Hàng đang điều chuyển MUST [NEEDS CLARIFICATION: tính là tồn kho đi, tồn kho đến, hay tồn trên đường? Phần Chưa chốt chưa có câu trả lời.]
- **FR-011**: Việc duyệt kiểm kê MUST [NEEDS CLARIFICATION: ai được duyệt, và chênh lệch có bắt buộc lý do cùng chứng từ không? Phần Chưa chốt chưa có câu trả lời.]

### Key Entities *(include if feature involves data)*

- **Địa điểm tồn**: Kho hoặc showroom có số tồn theo mặt hàng.
- **Phiếu chuyển**: Nơi xuất, nơi nhận, các dòng số lượng, ghi chú, trạng thái đang chuyển hoặc đã nhận.
- **Biên bản kiểm kê**: Địa điểm, mặt hàng, tồn sổ, số đếm, chênh lệch, lý do, trạng thái chờ duyệt hoặc đã duyệt.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trong 10 lần tra cứu một mã đã biết, 10/10 lần ra đúng mặt hàng và đọc được tồn tại ít nhất hai địa điểm.
- **SC-002**: 10/10 phiếu chuyển hợp lệ xuất hiện trong danh sách đang chuyển trước khi có người xác nhận nhận hàng.
- **SC-003**: 10/10 lần thử điều chỉnh làm tồn âm đều bị từ chối và tồn sau đó vẫn từ 0 trở lên.

## Assumptions

- Người dùng là nhân viên đã mở được màn kho. Bảng quyền chỉ là đề xuất. Spec này không chọn vai trò thủ kho hay trưởng showroom.
- Số lượng là số nguyên không âm. Số liệu mẫu không phải tồn thật.
- Quy tắc giữ hàng khi bán nằm ở spec `001-reserve-sale-stock`. Màn này hiện cột đang giữ, không đổi quy tắc đó.
- Hao hụt trên đường: [NEEDS CLARIFICATION: ghi thiếu ở kho đi, kho đến, hay một biên bản riêng? Phần Chưa chốt chưa có câu trả lời.]
- Hàng đang chuyển tính vào tồn nào, và ai được duyệt kiểm kê, được đánh dấu [NEEDS CLARIFICATION] ở FR-010 và FR-011. Hai mục đó chưa phải quy tắc.
